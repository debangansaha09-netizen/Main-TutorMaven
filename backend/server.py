from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET', 'tutormaven_secret_key_2025')
ALGORITHM = "HS256"
security = HTTPBearer()

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Enums
class UserRole(str, Enum):
    TUTOR = "tutor"
    STUDENT = "student"
    ADMIN = "admin"

class SubscriptionStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    REJECTED = "rejected"

class VerificationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class FeeStatus(str, Enum):
    PAID = "paid"
    UNPAID = "unpaid"

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole
    profile_picture: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AdminLogin(BaseModel):
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: UserRole
    profile_picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TutorProfileUpdate(BaseModel):
    bio: Optional[str] = None
    subjects: Optional[List[str]] = None
    monthly_fee: Optional[float] = None
    education: Optional[str] = None
    coaching_address: Optional[str] = None
    contact_number: Optional[str] = None
    coaching_photo: Optional[str] = None
    teaching_days: Optional[List[str]] = None
    hours_per_day: Optional[int] = None
    boards: Optional[List[str]] = None  # CBSE, ICSE, STATE BOARD
    name: Optional[str] = None

class TutorProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    bio: Optional[str] = None
    subjects: List[str] = []
    monthly_fee: float = 0
    education: Optional[str] = None
    coaching_address: Optional[str] = None
    contact_number: Optional[str] = None
    coaching_photo: Optional[str] = None
    teaching_days: List[str] = []
    hours_per_day: int = 0
    boards: List[str] = []  # CBSE, ICSE, STATE BOARD
    is_verified: bool = False
    verification_proof: Optional[str] = None
    verification_phone: Optional[str] = None
    verification_status: VerificationStatus = VerificationStatus.REJECTED  # Default to rejected so button shows
    verification_banner: Optional[str] = None  # Banner for verified tutors
    reach_count: int = 0
    subscriber_count: int = 0

class ClassTaught(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tutor_id: str
    class_range: str  # e.g., "7-8" or "1-5"
    subjects: List[str]

class SubscriptionCreate(BaseModel):
    tutor_id: str

class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    tutor_id: str
    status: SubscriptionStatus = SubscriptionStatus.PENDING
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_at: Optional[datetime] = None

class ReviewCreate(BaseModel):
    tutor_id: str
    rating: int  # 1-5
    comment: str

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    tutor_id: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FeeRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    subscription_id: str
    month: int
    year: int
    status: FeeStatus = FeeStatus.UNPAID
    marked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AttendanceRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    subscription_id: str
    date: str  # YYYY-MM-DD
    status: AttendanceStatus
    marked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str
    message: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class VerificationProof(BaseModel):
    proof_image: Optional[str] = None  # No longer required
    phone_number: str

class ParentLogin(BaseModel):
    parent_code: str

@api_router.post("/parents/login")
async def parent_login(credentials: ParentLogin):
    # Find student by parent code
    student_profile = await db.student_profiles.find_one({"parent_code": credentials.parent_code}, {"_id": 0})
    if not student_profile:
        raise HTTPException(status_code=401, detail="Invalid parent code")
    
    # Get student user data
    student = await db.users.find_one({"id": student_profile['user_id']}, {"_id": 0, "password_hash": 0})
    
    # Get subscriptions with fees and attendance
    subscriptions = await db.subscriptions.find(
        {"student_id": student_profile['user_id'], "status": SubscriptionStatus.ACTIVE},
        {"_id": 0}
    ).to_list(1000)
    
    # Fetch fees and attendance for each subscription
    subscription_details = []
    for sub in subscriptions:
        # Get tutor info
        tutor = await db.users.find_one({"id": sub['tutor_id']}, {"_id": 0, "password_hash": 0})
        tutor_profile = await db.tutor_profiles.find_one({"user_id": sub['tutor_id']}, {"_id": 0})
        
        # Get fees
        fees = await db.fee_records.find({"subscription_id": sub['id']}, {"_id": 0}).to_list(1000)
        
        # Get attendance
        attendance = await db.attendance_records.find({"subscription_id": sub['id']}, {"_id": 0}).to_list(1000)
        
        subscription_details.append({
            **sub,
            "tutor": tutor,
            "tutor_profile": tutor_profile,
            "fees": fees,
            "attendance": attendance
        })
    
    return {
        "student": student,
        "student_profile": student_profile,
        "subscriptions": subscription_details
    }

@api_router.post("/tutors/banner")
async def upload_banner(banner_data: dict, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Only tutors can upload banner")
    
    # Check if tutor is verified
    profile = await db.tutor_profiles.find_one({"user_id": current_user['id']})
    if not profile or not profile.get('is_verified'):
        raise HTTPException(status_code=403, detail="Only verified tutors can upload banner")
    
    await db.tutor_profiles.update_one(
        {"user_id": current_user['id']},
        {"$set": {"verification_banner": banner_data.get('banner')}}
    )
    
    return {"message": "Banner uploaded successfully"}

@api_router.get("/banners")
async def get_banners():
    # Get all verified tutors with banners
    profiles = await db.tutor_profiles.find(
        {"is_verified": True, "verification_banner": {"$exists": True, "$ne": None}},
        {"_id": 0, "verification_banner": 1, "user_id": 1}
    ).to_list(100)
    
    # Get user info for each
    result = []
    for profile in profiles:
        user = await db.users.find_one({"id": profile['user_id']}, {"_id": 0, "name": 1})
        if user and profile.get('verification_banner'):
            result.append({
                "banner": profile['verification_banner'],
                "tutor_name": user['name'],
                "tutor_id": profile['user_id']
            })
    
    return result

# Auth Routes
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        profile_picture=user_data.profile_picture
    )
    
    user_dict = user.model_dump()
    user_dict['password_hash'] = hash_password(user_data.password)
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create tutor profile if role is tutor
    if user_data.role == UserRole.TUTOR:
        profile = TutorProfile(user_id=user.id)
        profile_dict = profile.model_dump()
        await db.tutor_profiles.insert_one(profile_dict)
    
    # Create student profile if role is student
    if user_data.role == UserRole.STUDENT:
        student_profile = StudentProfile(user_id=user.id)
        profile_dict = student_profile.model_dump()
        await db.student_profiles.insert_one(profile_dict)
    
    # Create token
    token = create_access_token({"sub": user.id, "role": user.role})
    
    return {
        "token": token,
        "user": user.model_dump()
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user['id'], "role": user['role']})
    del user['password_hash']
    
    return {
        "token": token,
        "user": user
    }

@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    if credentials.password != "653165":
        raise HTTPException(status_code=401, detail="Invalid admin password")
    
    # Check if admin user exists
    admin = await db.users.find_one({"role": "admin"}, {"_id": 0})
    if not admin:
        # Create admin user
        admin_user = User(
            email="admin@tutormaven.com",
            name="Admin",
            role=UserRole.ADMIN
        )
        admin_dict = admin_user.model_dump()
        admin_dict['password_hash'] = hash_password("653165")
        admin_dict['created_at'] = admin_dict['created_at'].isoformat()
        await db.users.insert_one(admin_dict)
        admin = admin_dict
    
    token = create_access_token({"sub": admin['id'], "role": admin['role']})
    if 'password_hash' in admin:
        del admin['password_hash']
    
    return {
        "token": token,
        "user": admin
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

class StudentProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    school_name: Optional[str] = None
    board: Optional[str] = None  # CBSE, ICSE, STATE BOARD
    subjects_interested: List[str] = []
    parent_code: str = Field(default_factory=lambda: str(uuid.uuid4())[:8].upper())  # Unique code for parents

class StudentProfileUpdate(BaseModel):
    profile_picture: Optional[str] = None
    name: Optional[str] = None
    school_name: Optional[str] = None
    board: Optional[str] = None
    subjects_interested: Optional[List[str]] = None

@api_router.put("/students/profile")
async def update_student_profile(profile_data: StudentProfileUpdate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can update profile")
    
    # Update user fields
    user_updates = {}
    if profile_data.profile_picture:
        user_updates["profile_picture"] = profile_data.profile_picture
    if profile_data.name:
        user_updates["name"] = profile_data.name
    
    if user_updates:
        await db.users.update_one(
            {"id": current_user['id']},
            {"$set": user_updates}
        )
    
    # Update or create student profile
    profile_updates = {}
    if profile_data.school_name is not None:
        profile_updates["school_name"] = profile_data.school_name
    if profile_data.board is not None:
        profile_updates["board"] = profile_data.board
    if profile_data.subjects_interested is not None:
        profile_updates["subjects_interested"] = profile_data.subjects_interested
    
    if profile_updates:
        # Check if student profile exists
        existing = await db.student_profiles.find_one({"user_id": current_user['id']})
        if existing:
            await db.student_profiles.update_one(
                {"user_id": current_user['id']},
                {"$set": profile_updates}
            )
        else:
            # Create new profile
            new_profile = StudentProfile(user_id=current_user['id'], **profile_updates)
            await db.student_profiles.insert_one(new_profile.model_dump())
    
    return {"message": "Profile updated successfully"}

@api_router.get("/students/profile/{user_id}")
async def get_student_profile(user_id: str):
    profile = await db.student_profiles.find_one({"user_id": user_id}, {"_id": 0})
    return profile or {}

# Tutor Routes
@api_router.get("/tutors")
async def get_tutors(subject: Optional[str] = None):
    query = {}
    if subject:
        query["subjects"] = {"$in": [subject]}
    
    profiles = await db.tutor_profiles.find(query, {"_id": 0}).to_list(1000)
    
    # Get user data for each tutor
    result = []
    for profile in profiles:
        user = await db.users.find_one({"id": profile['user_id']}, {"_id": 0, "password_hash": 0})
        if user:
            # Get classes taught
            classes = await db.classes_taught.find({"tutor_id": profile['user_id']}, {"_id": 0}).to_list(100)
            # Get reviews
            reviews = await db.reviews.find({"tutor_id": profile['user_id']}, {"_id": 0}).to_list(100)
            avg_rating = sum([r['rating'] for r in reviews]) / len(reviews) if reviews else 0
            
            result.append({
                **profile,
                "user": user,
                "classes_taught": classes,
                "reviews": reviews,
                "avg_rating": avg_rating
            })
    
    return result

@api_router.get("/tutors/{tutor_id}")
async def get_tutor(tutor_id: str):
    profile = await db.tutor_profiles.find_one({"user_id": tutor_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Tutor not found")
    
    user = await db.users.find_one({"id": tutor_id}, {"_id": 0, "password_hash": 0})
    classes = await db.classes_taught.find({"tutor_id": tutor_id}, {"_id": 0}).to_list(100)
    reviews = await db.reviews.find({"tutor_id": tutor_id}, {"_id": 0}).to_list(100)
    
    # Get student info for reviews
    for review in reviews:
        student = await db.users.find_one({"id": review['student_id']}, {"_id": 0, "password_hash": 0})
        review['student'] = student
    
    avg_rating = sum([r['rating'] for r in reviews]) / len(reviews) if reviews else 0
    
    # Increment reach count
    await db.tutor_profiles.update_one(
        {"user_id": tutor_id},
        {"$inc": {"reach_count": 1}}
    )
    
    return {
        **profile,
        "user": user,
        "classes_taught": classes,
        "reviews": reviews,
        "avg_rating": avg_rating
    }

class ProfileUpdateWithPicture(TutorProfileUpdate):
    profile_picture: Optional[str] = None

@api_router.put("/tutors/profile")
async def update_tutor_profile(profile_data: ProfileUpdateWithPicture, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Only tutors can update profile")
    
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    
    # Update user fields (profile picture and name) in users collection
    user_updates = {}
    if update_data.get('profile_picture'):
        user_updates["profile_picture"] = update_data['profile_picture']
        del update_data['profile_picture']
    if update_data.get('name'):
        user_updates["name"] = update_data['name']
        del update_data['name']
    
    if user_updates:
        await db.users.update_one(
            {"id": current_user['id']},
            {"$set": user_updates}
        )
    
    if update_data:
        await db.tutor_profiles.update_one(
            {"user_id": current_user['id']},
            {"$set": update_data}
        )
    
    profile = await db.tutor_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    return profile

@api_router.post("/tutors/verification")
async def submit_verification(proof: VerificationProof, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Only tutors can submit verification")
    
    await db.tutor_profiles.update_one(
        {"user_id": current_user['id']},
        {"$set": {
            "verification_proof": proof.proof_image,
            "verification_phone": proof.phone_number,
            "verification_status": VerificationStatus.PENDING
        }}
    )
    
    return {"message": "Verification submitted successfully. Admin will review within 24-48 hours."}

@api_router.get("/tutors/stats/me")
async def get_tutor_stats(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Only tutors can view stats")
    
    profile = await db.tutor_profiles.find_one({"user_id": current_user['id']}, {"_id": 0})
    subscriptions = await db.subscriptions.find(
        {"tutor_id": current_user['id'], "status": SubscriptionStatus.ACTIVE},
        {"_id": 0}
    ).to_list(1000)
    
    # Calculate income
    total_income = len(subscriptions) * profile.get('monthly_fee', 0)
    
    return {
        "reach_count": profile.get('reach_count', 0),
        "subscriber_count": len(subscriptions),
        "total_hours_per_week": profile.get('total_hours_per_week', 0),
        "total_income": total_income
    }

# Subscription Routes
@api_router.post("/subscriptions")
async def create_subscription(sub_data: SubscriptionCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can subscribe")
    
    # Check if already subscribed
    existing = await db.subscriptions.find_one({
        "student_id": current_user['id'],
        "tutor_id": sub_data.tutor_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already subscribed or pending")
    
    subscription = Subscription(
        student_id=current_user['id'],
        tutor_id=sub_data.tutor_id
    )
    
    sub_dict = subscription.model_dump()
    sub_dict['created_at'] = sub_dict['created_at'].isoformat()
    await db.subscriptions.insert_one(sub_dict)
    
    # Create notification for tutor
    notification = Notification(
        user_id=sub_data.tutor_id,
        type="subscription_request",
        message=f"{current_user['name']} has requested to subscribe"
    )
    notif_dict = notification.model_dump()
    notif_dict['created_at'] = notif_dict['created_at'].isoformat()
    await db.notifications.insert_one(notif_dict)
    
    return subscription

@api_router.put("/subscriptions/accept/{subscription_id}")
async def accept_subscription(subscription_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Only tutors can accept subscriptions")
    
    subscription = await db.subscriptions.find_one({"id": subscription_id})
    if not subscription or subscription['tutor_id'] != current_user['id']:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    await db.subscriptions.update_one(
        {"id": subscription_id},
        {"$set": {
            "status": SubscriptionStatus.ACTIVE,
            "approved_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update subscriber count
    await db.tutor_profiles.update_one(
        {"user_id": current_user['id']},
        {"$inc": {"subscriber_count": 1}}
    )
    
    # Create notification for student
    notification = Notification(
        user_id=subscription['student_id'],
        type="subscription_accepted",
        message=f"Your subscription request has been accepted by {current_user['name']}"
    )
    notif_dict = notification.model_dump()
    notif_dict['created_at'] = notif_dict['created_at'].isoformat()
    await db.notifications.insert_one(notif_dict)
    
    return {"message": "Subscription accepted"}

@api_router.put("/subscriptions/reject/{subscription_id}")
async def reject_subscription(subscription_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Only tutors can reject subscriptions")
    
    subscription = await db.subscriptions.find_one({"id": subscription_id})
    if not subscription or subscription['tutor_id'] != current_user['id']:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    await db.subscriptions.update_one(
        {"id": subscription_id},
        {"$set": {"status": SubscriptionStatus.REJECTED}}
    )
    
    # Create notification for student
    notification = Notification(
        user_id=subscription['student_id'],
        type="subscription_rejected",
        message=f"Your subscription request has been rejected by {current_user['name']}"
    )
    notif_dict = notification.model_dump()
    notif_dict['created_at'] = notif_dict['created_at'].isoformat()
    await db.notifications.insert_one(notif_dict)
    
    return {"message": "Subscription rejected"}

@api_router.get("/subscriptions/my")
async def get_my_subscriptions(current_user: dict = Depends(get_current_user)):
    if current_user['role'] == UserRole.TUTOR:
        subscriptions = await db.subscriptions.find({"tutor_id": current_user['id']}, {"_id": 0}).to_list(1000)
        # Get student info
        for sub in subscriptions:
            student = await db.users.find_one({"id": sub['student_id']}, {"_id": 0, "password_hash": 0})
            sub['student'] = student
    else:
        subscriptions = await db.subscriptions.find({"student_id": current_user['id']}, {"_id": 0}).to_list(1000)
        # Get tutor info
        for sub in subscriptions:
            tutor = await db.users.find_one({"id": sub['tutor_id']}, {"_id": 0, "password_hash": 0})
            profile = await db.tutor_profiles.find_one({"user_id": sub['tutor_id']}, {"_id": 0})
            sub['tutor'] = tutor
            sub['tutor_profile'] = profile
    
    return subscriptions

# Review Routes
@api_router.post("/reviews")
async def create_review(review_data: ReviewCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can review")
    
    # Check if student has active subscription
    subscription = await db.subscriptions.find_one({
        "student_id": current_user['id'],
        "tutor_id": review_data.tutor_id,
        "status": SubscriptionStatus.ACTIVE
    })
    if not subscription:
        raise HTTPException(status_code=403, detail="You must have an active subscription to review")
    
    review = Review(
        student_id=current_user['id'],
        tutor_id=review_data.tutor_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    
    review_dict = review.model_dump()
    review_dict['created_at'] = review_dict['created_at'].isoformat()
    await db.reviews.insert_one(review_dict)
    
    return review

@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, current_user: dict = Depends(get_current_user)):
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review['student_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="You can only delete your own reviews")
    
    await db.reviews.delete_one({"id": review_id})
    return {"message": "Review deleted successfully"}

# Fee & Attendance Routes
@api_router.get("/fees/{subscription_id}")
async def get_fees(subscription_id: str, current_user: dict = Depends(get_current_user)):
    subscription = await db.subscriptions.find_one({"id": subscription_id})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Check access
    if current_user['role'] == UserRole.STUDENT and subscription['student_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user['role'] == UserRole.TUTOR and subscription['tutor_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    fees = await db.fee_records.find({"subscription_id": subscription_id}, {"_id": 0}).to_list(1000)
    return fees

@api_router.put("/fees/{subscription_id}")
async def update_fee(subscription_id: str, month: int, year: int, fee_status: FeeStatus, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Only tutors can update fees")
    
    subscription = await db.subscriptions.find_one({"id": subscription_id})
    if not subscription or subscription['tutor_id'] != current_user['id']:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Check if fee record exists
    existing = await db.fee_records.find_one({
        "subscription_id": subscription_id,
        "month": month,
        "year": year
    })
    
    if existing:
        await db.fee_records.update_one(
            {"id": existing['id']},
            {"$set": {"status": fee_status, "marked_at": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        fee_record = FeeRecord(
            subscription_id=subscription_id,
            month=month,
            year=year,
            status=fee_status
        )
        fee_dict = fee_record.model_dump()
        fee_dict['marked_at'] = fee_dict['marked_at'].isoformat()
        await db.fee_records.insert_one(fee_dict)
    
    # Create notification if unpaid
    if fee_status == FeeStatus.UNPAID:
        notification = Notification(
            user_id=subscription['student_id'],
            type="fee_unpaid",
            message=f"Your fee for {month}/{year} has been marked as unpaid by {current_user['name']}"
        )
        notif_dict = notification.model_dump()
        notif_dict['created_at'] = notif_dict['created_at'].isoformat()
        await db.notifications.insert_one(notif_dict)
    
    return {"message": "Fee status updated"}

@api_router.get("/attendance/{subscription_id}")
async def get_attendance(subscription_id: str, current_user: dict = Depends(get_current_user)):
    subscription = await db.subscriptions.find_one({"id": subscription_id})
    if not subscription:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Check access
    if current_user['role'] == UserRole.STUDENT and subscription['student_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user['role'] == UserRole.TUTOR and subscription['tutor_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    attendance = await db.attendance_records.find({"subscription_id": subscription_id}, {"_id": 0}).to_list(1000)
    return attendance

@api_router.post("/attendance/{subscription_id}")
async def mark_attendance(subscription_id: str, date: str, attendance_status: AttendanceStatus, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Only tutors can mark attendance")
    
    subscription = await db.subscriptions.find_one({"id": subscription_id})
    if not subscription or subscription['tutor_id'] != current_user['id']:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    # Check if attendance exists for date
    existing = await db.attendance_records.find_one({
        "subscription_id": subscription_id,
        "date": date
    })
    
    if existing:
        await db.attendance_records.update_one(
            {"id": existing['id']},
            {"$set": {"status": attendance_status, "marked_at": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        attendance = AttendanceRecord(
            subscription_id=subscription_id,
            date=date,
            status=attendance_status
        )
        att_dict = attendance.model_dump()
        att_dict['marked_at'] = att_dict['marked_at'].isoformat()
        await db.attendance_records.insert_one(att_dict)
    
    return {"message": "Attendance marked"}

# Classes Taught Routes
@api_router.get("/classes/{tutor_id}")
async def get_classes(tutor_id: str):
    classes = await db.classes_taught.find({"tutor_id": tutor_id}, {"_id": 0}).to_list(100)
    return classes

@api_router.post("/classes")
async def add_class(class_range: str, subjects: List[str], current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Only tutors can add classes")
    
    class_taught = ClassTaught(
        tutor_id=current_user['id'],
        class_range=class_range,
        subjects=subjects
    )
    
    await db.classes_taught.insert_one(class_taught.model_dump())
    return class_taught

@api_router.delete("/classes/{class_id}")
async def delete_class(class_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.TUTOR:
        raise HTTPException(status_code=403, detail="Only tutors can delete classes")
    
    await db.classes_taught.delete_one({"id": class_id, "tutor_id": current_user['id']})
    return {"message": "Class deleted"}

# Notification Routes
@api_router.get("/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user['id']},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

@api_router.get("/notifications/unread/count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    count = await db.notifications.count_documents({
        "user_id": current_user['id'],
        "read": False
    })
    return {"count": count}

# Admin Routes
@api_router.get("/admin/verifications")
async def get_pending_verifications(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    profiles = await db.tutor_profiles.find(
        {"verification_status": VerificationStatus.PENDING},
        {"_id": 0}
    ).to_list(1000)
    
    # Get user info for each
    for profile in profiles:
        user = await db.users.find_one({"id": profile['user_id']}, {"_id": 0, "password_hash": 0})
        profile['user'] = user
    
    return profiles

@api_router.put("/admin/verifications/{user_id}/approve")
async def approve_verification(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.tutor_profiles.update_one(
        {"user_id": user_id},
        {"$set": {
            "is_verified": True,
            "verification_status": VerificationStatus.APPROVED
        }}
    )
    
    # Create notification for tutor
    notification = Notification(
        user_id=user_id,
        type="verification_approved",
        message="Your verification has been approved! You now have a verified badge."
    )
    notif_dict = notification.model_dump()
    notif_dict['created_at'] = notif_dict['created_at'].isoformat()
    await db.notifications.insert_one(notif_dict)
    
    return {"message": "Verification approved"}

@api_router.put("/admin/verifications/{user_id}/reject")
async def reject_verification(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    await db.tutor_profiles.update_one(
        {"user_id": user_id},
        {"$set": {"verification_status": VerificationStatus.REJECTED}}
    )
    
    # Create notification for tutor
    notification = Notification(
        user_id=user_id,
        type="verification_rejected",
        message="Your verification has been rejected. Please try again with valid proof."
    )
    notif_dict = notification.model_dump()
    notif_dict['created_at'] = notif_dict['created_at'].isoformat()
    await db.notifications.insert_one(notif_dict)
    
    return {"message": "Verification rejected"}

@api_router.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Delete user and related data
    await db.users.delete_one({"id": user_id})
    await db.tutor_profiles.delete_one({"user_id": user_id})
    await db.subscriptions.delete_many({"$or": [{"student_id": user_id}, {"tutor_id": user_id}]})
    await db.reviews.delete_many({"$or": [{"student_id": user_id}, {"tutor_id": user_id}]})
    await db.notifications.delete_many({"user_id": user_id})
    await db.classes_taught.delete_many({"tutor_id": user_id})
    
    return {"message": "User deleted successfully"}

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_users = await db.users.count_documents({})
    total_tutors = await db.users.count_documents({"role": UserRole.TUTOR})
    total_students = await db.users.count_documents({"role": UserRole.STUDENT})
    total_subscriptions = await db.subscriptions.count_documents({"status": SubscriptionStatus.ACTIVE})
    pending_verifications = await db.tutor_profiles.count_documents({"verification_status": VerificationStatus.PENDING})
    
    # Get all active subscriptions with fee and attendance info
    subscriptions = await db.subscriptions.find({"status": SubscriptionStatus.ACTIVE}, {"_id": 0}).to_list(1000)
    subscription_details = []
    
    for sub in subscriptions:
        student = await db.users.find_one({"id": sub['student_id']}, {"_id": 0, "password_hash": 0})
        tutor = await db.users.find_one({"id": sub['tutor_id']}, {"_id": 0, "password_hash": 0})
        fees = await db.fee_records.find({"subscription_id": sub['id']}, {"_id": 0}).to_list(100)
        attendance = await db.attendance_records.find({"subscription_id": sub['id']}, {"_id": 0}).to_list(1000)
        
        subscription_details.append({
            **sub,
            "student": student,
            "tutor": tutor,
            "fees": fees,
            "attendance": attendance
        })
    
    return {
        "total_users": total_users,
        "total_tutors": total_tutors,
        "total_students": total_students,
        "total_subscriptions": total_subscriptions,
        "pending_verifications": pending_verifications,
        "subscription_details": subscription_details
    }

@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
