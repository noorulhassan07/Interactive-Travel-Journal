import os
import uuid
from typing import Optional, BinaryIO
from fastapi import HTTPException
from hdfs import InsecureClient, HdfsError
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class HDFSService:
    """Service for interacting with HDFS"""
    
    def __init__(self):
        self.namenode_url = os.getenv("HDFS_NAMENODE", "hdfs://namenode:9000")
        self.webui_url = os.getenv("HDFS_WEBUI", "http://namenode:9870")
        self.hdfs_user = os.getenv("HDFS_USER", "hadoop")
        self.client: Optional[InsecureClient] = None
        self.base_path = "/travel_journal"
        
    def connect(self) -> bool:
        """Establish connection to HDFS"""
        try:
            logger.info(f"Connecting to HDFS at {self.webui_url} as {self.hdfs_user}")
            self.client = InsecureClient(self.webui_url, user=self.hdfs_user)
            
            self.client.status("/")
            
            self._init_directories()
            
            logger.info("HDFS connection established successfully")
            return True
        except Exception as e:
            logger.error(f"HDFS connection failed: {str(e)}")
            self.client = None
            return False
    
    def _init_directories(self):
        """Create necessary directories in HDFS"""
        directories = [
            self.base_path,
            f"{self.base_path}/photos",
            f"{self.base_path}/photos/original",
            f"{self.base_path}/photos/thumbnails",
            f"{self.base_path}/backups",
            f"{self.base_path}/analytics",
            f"{self.base_path}/logs"
        ]
        
        for directory in directories:
            try:
                if not self.client.status(directory, strict=False):
                    self.client.makedirs(directory)
                    logger.info(f"Created HDFS directory: {directory}")
            except Exception as e:
                logger.warning(f"Failed to create directory {directory}: {str(e)}")
    
    def upload_photo(self, user_id: str, photo_data: bytes, filename: str) -> str:
        """
        Upload photo to HDFS
        
        Args:
            user_id: User ID
            photo_data: Binary photo data
            filename: Original filename
        
        Returns:
            HDFS path where photo is stored
        """
        if not self.client:
            if not self.connect():
                raise HTTPException(status_code=500, detail="HDFS not available")
        
        try:
            file_ext = os.path.splitext(filename)[1].lower() or '.jpg'
            unique_filename = f"{uuid.uuid4()}{file_ext}"
            
            user_dir = f"{self.base_path}/photos/original/{user_id}"
            if not self.client.status(user_dir, strict=False):
                self.client.makedirs(user_dir)
            
            hdfs_path = f"{user_dir}/{unique_filename}"
            
            logger.info(f"Uploading photo to HDFS: {hdfs_path}")
            
            with self.client.write(hdfs_path, overwrite=True) as writer:
                writer.write(photo_data)
            
            self._create_thumbnail(user_id, photo_data, unique_filename, file_ext)
            
            logger.info(f"Photo uploaded successfully: {hdfs_path}")
            return hdfs_path
            
        except HdfsError as e:
            logger.error(f"HDFS upload error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"HDFS upload failed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during upload: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def _create_thumbnail(self, user_id: str, photo_data: bytes, filename: str, file_ext: str):
        """Create thumbnail version of photo (optional)"""
        try:
            from PIL import Image
            import io
        
            thumb_dir = f"{self.base_path}/photos/thumbnails/{user_id}"
            if not self.client.status(thumb_dir, strict=False):
                self.client.makedirs(thumb_dir)
            
        
            image = Image.open(io.BytesIO(photo_data))
            image.thumbnail((300, 300))
        
            thumb_io = io.BytesIO()
            if file_ext in ['.jpg', '.jpeg']:
                image.save(thumb_io, format='JPEG', quality=85)
            elif file_ext == '.png':
                image.save(thumb_io, format='PNG')
            else:
                image.save(thumb_io, format='JPEG', quality=85)
            
            thumb_data = thumb_io.getvalue()
            
            thumb_path = f"{thumb_dir}/{filename}"
            with self.client.write(thumb_path, overwrite=True) as writer:
                writer.write(thumb_data)
                
        except ImportError:
            logger.warning("PIL not installed, skipping thumbnail creation")
        except Exception as e:
            logger.warning(f"Failed to create thumbnail: {str(e)}")
    
    def read_file(self, hdfs_path: str) -> bytes:
        """Read file from HDFS"""
        if not self.client:
            if not self.connect():
                raise HTTPException(status_code=500, detail="HDFS not available")
        
        try:
            with self.client.read(hdfs_path) as reader:
                return reader.read()
        except HdfsError as e:
            logger.error(f"HDFS read error: {str(e)}")
            raise HTTPException(status_code=404, detail="File not found in HDFS")
        except Exception as e:
            logger.error(f"Unexpected error reading from HDFS: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def delete_file(self, hdfs_path: str) -> bool:
        """Delete file from HDFS"""
        if not self.client:
            if not self.connect():
                return False
        
        try:
            self.client.delete(hdfs_path)
            logger.info(f"Deleted file from HDFS: {hdfs_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete file from HDFS: {str(e)}")
            return False
    
    def list_user_photos(self, user_id: str) -> list:
        """List all photos for a user"""
        if not self.client:
            if not self.connect():
                return []
        
        try:
            user_dir = f"{self.base_path}/photos/original/{user_id}"
            if self.client.status(user_dir, strict=False):
                return self.client.list(user_dir)
            return []
        except Exception as e:
            logger.error(f"Failed to list user photos: {str(e)}")
            return []
    
    def get_hdfs_stats(self) -> dict:
        """Get HDFS storage statistics"""
        if not self.client:
            if not self.connect():
                return {"status": "disconnected"}
        
        try:
            status = self.client.status("/")
            
            photos_count = 0
            total_photo_size = 0
            
            try:
                photos = self.client.list(f"{self.base_path}/photos/original", status=True)
                for photo in photos:
                    photos_count += 1
                    total_photo_size += photo.get('length', 0)
            except:
                pass
            
            return {
                "status": "connected",
                "hdfs_capacity": status.get('capacity', 0),
                "hdfs_used": status.get('used', 0),
                "hdfs_remaining": status.get('remaining', 0),
                "photos_count": photos_count,
                "total_photo_size": total_photo_size,
                "base_path": self.base_path
            }
        except Exception as e:
            logger.error(f"Failed to get HDFS stats: {str(e)}")
            return {"status": "error", "message": str(e)}


hdfs_service = HDFSService()
