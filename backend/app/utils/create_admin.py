import asyncio
from app.models.user_model import User
from app.utils.hash_utils import hash_password

async def create_admin():
    hashed_pwd = hash_password("admin@123")
    admin_user = User(
        username="admin",
        email="admin@gmail.com",
        password=hashed_pwd,
        isAdmin=True,
        following=[],
        countriesVisited=0
    )
    await admin_user.insert()
    print("Admin user created successfully!")

if __name__ == "__main__":
    asyncio.run(create_admin())
