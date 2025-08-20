from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import json
import shutil
from datetime import datetime
from typing import List, Optional
import uuid
from pathlib import Path

app = FastAPI(title="Garun System Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
UPLOAD_DIR = Path("uploads")
COMPLAINTS_DIR = UPLOAD_DIR / "complaints"
PROPERTY_DIR = UPLOAD_DIR / "property"
BUILDING_DIR = UPLOAD_DIR / "building"
ADMIN_DIR = UPLOAD_DIR / "admin"
SURVEYS_DIR = UPLOAD_DIR / "surveys"

for directory in [UPLOAD_DIR, COMPLAINTS_DIR, PROPERTY_DIR, BUILDING_DIR, ADMIN_DIR, SURVEYS_DIR]:
    directory.mkdir(exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Data storage (in-memory for now, in production use a database)
complaints_db = []
property_verifications_db = []
building_approvals_db = []
surveys_db = []
illegal_constructions_db = []
admin_data = {
    "complaints": [],
    "property_verifications": [],
    "building_approvals": [],
    "field_surveys": [],
    "drone_fleet": [],
    "data_collection": [],
    "audit_trail": [],
    "surveys": [],
    "illegal_constructions": []
}

# Persistent storage files
DATA_DIR = Path("data")
COMPLAINTS_FILE = DATA_DIR / "complaints.json"
PROPERTY_FILE = DATA_DIR / "property_verifications.json"
BUILDING_FILE = DATA_DIR / "building_approvals.json"
SURVEYS_FILE = DATA_DIR / "surveys.json"
ILLEGAL_FILE = DATA_DIR / "illegal_constructions.json"

# Create data directory
DATA_DIR.mkdir(exist_ok=True)

# Load data from files if they exist
def load_data():
    """Load data from JSON files"""
    global complaints_db, property_verifications_db, building_approvals_db, surveys_db, illegal_constructions_db
    
    try:
        if COMPLAINTS_FILE.exists():
            with open(COMPLAINTS_FILE, 'r', encoding='utf-8') as f:
                complaints_db = json.load(f)
        
        if PROPERTY_FILE.exists():
            with open(PROPERTY_FILE, 'r', encoding='utf-8') as f:
                property_verifications_db = json.load(f)
        
        if BUILDING_FILE.exists():
            with open(BUILDING_FILE, 'r', encoding='utf-8') as f:
                building_approvals_db = json.load(f)
        
        if SURVEYS_FILE.exists():
            with open(SURVEYS_FILE, 'r', encoding='utf-8') as f:
                surveys_db = json.load(f)
        
        if ILLEGAL_FILE.exists():
            with open(ILLEGAL_FILE, 'r', encoding='utf-8') as f:
                illegal_constructions_db = json.load(f)
                
        print(f"Loaded {len(complaints_db)} complaints, {len(property_verifications_db)} property verifications, {len(building_approvals_db)} building approvals")
    except Exception as e:
        print(f"Error loading data: {e}")
        # Initialize empty lists if loading fails
        complaints_db = []
        property_verifications_db = []
        building_approvals_db = []
        surveys_db = []
        illegal_constructions_db = []

def save_data():
    """Save data to JSON files"""
    try:
        with open(COMPLAINTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(complaints_db, f, indent=2, ensure_ascii=False)
        
        with open(PROPERTY_FILE, 'w', encoding='utf-8') as f:
            json.dump(property_verifications_db, f, indent=2, ensure_ascii=False)
        
        with open(BUILDING_FILE, 'w', encoding='utf-8') as f:
            json.dump(building_approvals_db, f, indent=2, ensure_ascii=False)
        
        with open(SURVEYS_FILE, 'w', encoding='utf-8') as f:
            json.dump(surveys_db, f, indent=2, ensure_ascii=False)
        
        with open(ILLEGAL_FILE, 'w', encoding='utf-8') as f:
            json.dump(illegal_constructions_db, f, indent=2, ensure_ascii=False)
            
        print("Data saved successfully")
    except Exception as e:
        print(f"Error saving data: {e}")

# Load data on startup
load_data()

# Helper functions
def generate_id(prefix: str) -> str:
    """Generate unique ID with prefix"""
    return f"{prefix}{datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())[:8]}"

def save_file(file: UploadFile, directory: Path) -> str:
    """Save uploaded file and return filename"""
    if not file:
        return ""
    
    # Create unique filename
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = directory / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return str(file_path)

def update_admin_data():
    """Update admin dashboard data"""
    admin_data["complaints"] = complaints_db
    admin_data["property_verifications"] = property_verifications_db
    admin_data["building_approvals"] = building_approvals_db
    admin_data["surveys"] = surveys_db
    admin_data["illegal_constructions"] = illegal_constructions_db

def validate_and_clean_survey_data(survey_data):
    """Validate and clean survey data to ensure proper types"""
    if not isinstance(survey_data, dict):
        print("Warning: survey_data is not a dictionary")
        return None
    
    # Ensure buildings array exists and is a list
    if "buildings" not in survey_data:
        survey_data["buildings"] = []
    elif not isinstance(survey_data["buildings"], list):
        survey_data["buildings"] = []
    
    # Ensure roads array exists and is a list
    if "roads" not in survey_data:
        survey_data["roads"] = []
    elif not isinstance(survey_data["roads"], list):
        survey_data["roads"] = []
    
    # Ensure land_usage object exists
    if "land_usage" not in survey_data:
        survey_data["land_usage"] = {}
    elif not isinstance(survey_data["land_usage"], dict):
        survey_data["land_usage"] = {}
    
    return survey_data

def detect_illegal_constructions(survey_data, regulations):
    """Detect illegal constructions based on survey data and regulations"""
    violations = []
    
    # Validate and clean survey data
    survey_data = validate_and_clean_survey_data(survey_data)
    if survey_data is None:
        print("Warning: Invalid survey data, skipping validation")
        return violations
    
    # Check building violations
    for building in survey_data.get("buildings", []):
        building_type = building.get("type", "residential")
        zone_regulations = regulations["zones"].get(building_type, regulations["zones"]["residential"])
        
        # Convert string values to float/int for comparison with error handling
        try:
            height_meters = float(building.get("height_meters", 0) or 0)
            floors = int(building.get("floors", 0) or 0)
            area_sq_meters = float(building.get("area_sq_meters", 0) or 0)
            
            # Debug logging
            print(f"Processing building: height={height_meters}, floors={floors}, area={area_sq_meters}")
            
        except (ValueError, TypeError) as e:
            print(f"Warning: Failed to convert building data for building {building.get('building_id', 'unknown')}: {e}")
            # Skip this building if conversion fails
            continue
        
        # Height violations
        height_limit = zone_regulations["building_regulations"]["building_height_limit_meters"]
        print(f"Comparing height: {height_meters} (type: {type(height_meters)}) > {height_limit} (type: {type(height_limit)})")
        if height_meters > height_limit:
            violations.append({
                "building_id": building.get("building_id"),
                "type": "height_violation",
                "current": height_meters,
                "allowed": zone_regulations["building_regulations"]["building_height_limit_meters"],
                "severity": "high",
                "description": f"Building height {height_meters}m exceeds limit of {zone_regulations['building_regulations']['building_height_limit_meters']}m for {building_type} zone"
            })
        
        # Floor violations
        max_floors_limit = zone_regulations["building_regulations"]["max_floors"]
        print(f"Comparing floors: {floors} (type: {type(floors)}) > {max_floors_limit} (type: {type(max_floors_limit)})")
        if floors > max_floors_limit:
            violations.append({
                "building_id": building.get("building_id"),
                "type": "floor_violation",
                "current": floors,
                "allowed": zone_regulations["building_regulations"]["max_floors"],
                "severity": "high",
                "description": f"Building has {floors} floors, exceeding limit of {zone_regulations['building_regulations']['max_floors']} for {building_type} zone"
            })
        
        # FAR violations (Floor Area Ratio)
        if floors > 0 and area_sq_meters > 0:
            plot_area = area_sq_meters / floors
            far = area_sq_meters / plot_area if plot_area > 0 else 0
            far_limit = zone_regulations["building_regulations"]["floor_area_ratio"]
            print(f"Comparing FAR: {far} (type: {type(far)}) > {far_limit} (type: {type(far_limit)})")
            if far > far_limit:
                violations.append({
                    "building_id": building.get("building_id"),
                    "type": "far_violation",
                    "current": round(far, 2),
                    "allowed": zone_regulations["building_regulations"]["floor_area_ratio"],
                    "severity": "medium",
                    "description": f"FAR {round(far, 2)} exceeds limit of {zone_regulations['building_regulations']['floor_area_ratio']} for {building_type} zone"
                })
        
        # Setback violations (if setback data is provided)
        setbacks = building.get("setbacks", {})
        if setbacks:
            try:
                front_setback = float(setbacks.get("front_setback_meters", 0) or 0)
                required_front = zone_regulations["building_regulations"]["setbacks"]["front_setback_meters"]
                print(f"Comparing setback: {front_setback} (type: {type(front_setback)}) < {required_front} (type: {type(required_front)})")
                if front_setback < required_front:
                    violations.append({
                        "building_id": building.get("building_id"),
                        "type": "setback_violation",
                        "current": front_setback,
                        "allowed": required_front,
                        "severity": "medium",
                        "description": f"Front setback {front_setback}m is less than required {required_front}m for {building_type} zone"
                    })
            except (ValueError, TypeError):
                # Skip setback validation if conversion fails
                pass
    
    # Check road violations
    for road in survey_data.get("roads", []):
        road_type = road.get("surface_type", "asphalt")
        min_width = 9 if road_type in ["asphalt", "concrete"] else 6
        
        # Convert string values to float for comparison with error handling
        try:
            width_meters = float(road.get("width_meters", 0) or 0)
            length_meters = float(road.get("length_meters", 0) or 0)
            
            # Debug logging
            print(f"Processing road: width={width_meters}, length={length_meters}")
            
        except (ValueError, TypeError) as e:
            print(f"Warning: Failed to convert road data for road {road.get('road_id', 'unknown')}: {e}")
            # Skip this road if conversion fails
            continue
        
        print(f"Comparing road width: {width_meters} (type: {type(width_meters)}) < {min_width} (type: {type(min_width)})")
        if width_meters < min_width:
            violations.append({
                "road_id": road.get("road_id"),
                "type": "road_width_violation",
                "current": width_meters,
                "allowed": min_width,
                "severity": "medium",
                "description": f"Road width {width_meters}m is less than minimum {min_width}m for {road_type} surface"
            })
        
        # Check road length for very short roads (potential encroachment)
        print(f"Comparing road length: {length_meters} (type: {type(length_meters)}) < 5")
        if length_meters < 5:
            violations.append({
                "road_id": road.get("road_id"),
                "type": "road_encroachment_suspicion",
                "current": length_meters,
                "allowed": 5,
                "severity": "low",
                "description": f"Road length {length_meters}m is suspiciously short, possible encroachment"
            })
    
    # Check land usage violations
    land_usage = survey_data.get("land_usage", {})
    
    # Convert string values to float for land usage calculations with error handling
    try:
        residential_area = float(land_usage.get("residential_area_sq_meters", 0) or 0)
        commercial_area = float(land_usage.get("commercial_area_sq_meters", 0) or 0)
        industrial_area = float(land_usage.get("industrial_area_sq_meters", 0) or 0)
        green_area = float(land_usage.get("green_area_sq_meters", 0) or 0)
        
        total_area = residential_area + commercial_area + industrial_area
        
        # Debug logging
        print(f"Land usage: residential={residential_area}, commercial={commercial_area}, industrial={industrial_area}, green={green_area}, total={total_area}")
        
        if total_area > 0:
            green_area_percent = (green_area / total_area) * 100
            min_green_area = 10  # Default minimum
            
            # Adjust based on zone type if available
            if survey_data.get("zone_type") == "commercial":
                min_green_area = 5
            elif survey_data.get("zone_type") == "industrial":
                min_green_area = 8
            
            print(f"Comparing green area: {green_area_percent} (type: {type(green_area_percent)}) < {min_green_area} (type: {type(min_green_area)})")
            if green_area_percent < min_green_area:
                violations.append({
                    "type": "green_area_violation",
                    "current": round(green_area_percent, 2),
                    "allowed": min_green_area,
                    "severity": "low",
                    "description": f"Green area {round(green_area_percent, 2)}% is less than minimum {min_green_area}% requirement"
                })
            
            # Check for excessive commercial/industrial area in residential zones
            if survey_data.get("zone_type") == "residential":
                commercial_percent = (commercial_area / total_area) * 100
                print(f"Comparing commercial area: {commercial_percent} (type: {type(commercial_percent)}) > 20")
                if commercial_percent > 20:  # Max 20% commercial in residential zone
                    violations.append({
                        "type": "zone_misuse_violation",
                        "current": round(commercial_percent, 2),
                        "allowed": 20,
                        "severity": "high",
                        "description": f"Commercial area {round(commercial_percent, 2)}% exceeds 20% limit in residential zone"
                    })
    except (ValueError, TypeError) as e:
        print(f"Warning: Failed to convert land usage data: {e}")
        # Skip land usage validation if conversion fails
        pass
    
    # Check for missing essential data
    if not survey_data.get("buildings") and not survey_data.get("roads"):
        violations.append({
            "type": "data_incomplete_violation",
            "current": "No buildings or roads data",
            "allowed": "Complete survey data required",
            "severity": "medium",
            "description": "Survey data is incomplete - missing buildings and roads information"
        })
    
    return violations

# Complaint endpoints
@app.post("/api/complaints/register")
async def register_complaint(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    incident_date: str = Form(...),
    incident_time: Optional[str] = Form(None),
    address: str = Form(...),
    ward: str = Form(...),
    zone: str = Form(...),
    latitude: Optional[str] = Form(None),
    longitude: Optional[str] = Form(None),
    landmark: Optional[str] = Form(None),
    full_name: str = Form(...),
    father_name: Optional[str] = Form(None),
    mother_name: Optional[str] = Form(None),
    date_of_birth: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    contact_number: str = Form(...),
    residential_address: Optional[str] = Form(None),
    permanent_address: Optional[str] = Form(None),
    id_proof_type: str = Form(...),
    id_proof_number: str = Form(...),
    photos: List[UploadFile] = File([]),
    videos: List[UploadFile] = File([]),
    documents: List[UploadFile] = File([]),
    id_proof_document: Optional[UploadFile] = File(None),
    selfie: Optional[UploadFile] = File(None)
):
    """Register a new complaint"""
    try:
        complaint_id = generate_id("GRV")
        
        # Save uploaded files
        photo_paths = []
        for photo in photos:
            if photo:
                photo_path = save_file(photo, COMPLAINTS_DIR)
                photo_paths.append(photo_path)
        
        video_paths = []
        for video in videos:
            if video:
                video_path = save_file(video, COMPLAINTS_DIR)
                video_paths.append(video_path)
        
        document_paths = []
        for doc in documents:
            if doc:
                doc_path = save_file(doc, COMPLAINTS_DIR)
                document_paths.append(doc_path)
        
        id_proof_path = ""
        if id_proof_document:
            id_proof_path = save_file(id_proof_document, COMPLAINTS_DIR)
        
        selfie_path = ""
        if selfie:
            selfie_path = save_file(selfie, COMPLAINTS_DIR)
        
        # Create complaint object
        complaint = {
            "id": complaint_id,
            "title": title,
            "description": description,
            "category": category,
            "incident_date": incident_date,
            "incident_time": incident_time,
            "address": address,
            "ward": ward,
            "zone": zone,
            "latitude": latitude,
            "longitude": longitude,
            "landmark": landmark,
            "complainant": {
                "full_name": full_name,
                "father_name": father_name,
                "mother_name": mother_name,
                "date_of_birth": date_of_birth,
                "gender": gender,
                "contact_number": contact_number,
                "residential_address": residential_address,
                "permanent_address": permanent_address,
                "id_proof_type": id_proof_type,
                "id_proof_number": id_proof_number
            },
            "files": {
                "photos": photo_paths,
                "videos": video_paths,
                "documents": document_paths,
                "id_proof": id_proof_path,
                "selfie": selfie_path
            },
            "status": "New",
            "priority": "Medium",
            "submitted_at": datetime.now().isoformat(),
            "updates": [
                {
                    "date": datetime.now().isoformat(),
                    "status": "New",
                    "message": "Complaint registered successfully",
                    "officer": "System"
                }
            ],
            "assigned_to": None,
            "officer": None,
            "contact": None,
            "estimated_resolution": None,
            "resolved_at": None
        }
        
        complaints_db.append(complaint)
        update_admin_data()
        save_data()  # Save data after each complaint registration
        
        print(f"Complaint registered successfully: {complaint_id}")
        print(f"Total complaints in database: {len(complaints_db)}")
        
        return {
            "success": True,
            "message": "Complaint registered successfully",
            "complaint_id": complaint_id,
            "complaint": complaint
        }
    
    except Exception as e:
        print(f"Error registering complaint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to register complaint: {str(e)}")

@app.get("/api/complaints/track/{complaint_id}")
async def track_complaint(complaint_id: str):
    """Track complaint status by ID"""
    print(f"Tracking complaint with ID: {complaint_id}")
    print(f"Available complaints: {[c['id'] for c in complaints_db]}")
    
    # Try exact match first
    complaint = next((c for c in complaints_db if c["id"] == complaint_id), None)
    
    # If not found, try case-insensitive match
    if not complaint:
        complaint = next((c for c in complaints_db if c["id"].lower() == complaint_id.lower()), None)
    
    if not complaint:
        print(f"Complaint not found for ID: {complaint_id}")
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    print(f"Found complaint: {complaint['id']} - {complaint['title']}")
    
    return {
        "success": True,
        "complaint": complaint
    }

@app.get("/api/complaints/user/{user_id}")
async def get_user_complaints(user_id: str):
    """Get all complaints for a specific user (by contact number)"""
    user_complaints = [c for c in complaints_db if c["complainant"]["contact_number"] == user_id]
    
    return {
        "success": True,
        "complaints": user_complaints,
        "total": len(user_complaints)
    }

@app.get("/api/complaints/all")
async def get_all_complaints():
    """Get all complaints (for admin dashboard)"""
    return {
        "success": True,
        "complaints": complaints_db,
        "total": len(complaints_db)
    }

@app.put("/api/complaints/{complaint_id}/status")
async def update_complaint_status(
    complaint_id: str,
    status: str = Form(...),
    message: str = Form(...),
    officer: str = Form(...),
    priority: Optional[str] = Form(None),
    assigned_to: Optional[str] = Form(None),
    estimated_resolution: Optional[str] = Form(None)
):
    """Update complaint status (for admin use)"""
    print(f"Updating complaint status for ID: {complaint_id}")
    
    # Try exact match first
    complaint = next((c for c in complaints_db if c["id"] == complaint_id), None)
    
    # If not found, try case-insensitive match
    if not complaint:
        complaint = next((c for c in complaints_db if c["id"].lower() == complaint_id.lower()), None)
    
    if not complaint:
        print(f"Complaint not found for ID: {complaint_id}")
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    print(f"Found complaint: {complaint['id']} - {complaint['title']}")
    
    # Update status
    complaint["status"] = status
    if priority:
        complaint["priority"] = priority
    if assigned_to:
        complaint["assigned_to"] = assigned_to
    if estimated_resolution:
        complaint["estimated_resolution"] = estimated_resolution
    
    # Add update to timeline
    update_entry = {
        "date": datetime.now().isoformat(),
        "status": status,
        "message": message,
        "officer": officer
    }
    complaint["updates"].append(update_entry)
    
    # Update resolved_at if status is resolved
    if status == "Resolved":
        complaint["resolved_at"] = datetime.now().isoformat()
    
    update_admin_data()
    save_data() # Save data after each complaint status update
    
    return {
        "success": True,
        "message": "Complaint status updated successfully",
        "complaint": complaint
    }

# Property verification endpoints
@app.post("/api/property/verify")
async def submit_property_verification(
    full_name: str = Form(...),
    aadhaar_number: str = Form(...),
    contact_number: str = Form(...),
    email_id: str = Form(...),
    permanent_address: str = Form(...),
    sale_deed: Optional[UploadFile] = File(None),
    property_tax_receipt: Optional[UploadFile] = File(None),
    khata_certificate: Optional[UploadFile] = File(None),
    encumbrance_certificate: Optional[UploadFile] = File(None),
    mutation_certificate: Optional[UploadFile] = File(None),
    rtc_document: Optional[UploadFile] = File(None),
    layout_plan: Optional[UploadFile] = File(None),
    architectural_drawings: Optional[UploadFile] = File(None),
    structural_certificate: Optional[UploadFile] = File(None),
    aadhaar_card: Optional[UploadFile] = File(None),
    pan_card: Optional[UploadFile] = File(None),
    electricity_bill: Optional[UploadFile] = File(None)
):
    """Submit property documents for verification"""
    try:
        ticket_number = generate_id("PVT")
        
        # Save uploaded files
        files = {}
        file_fields = {
            "sale_deed": sale_deed,
            "property_tax_receipt": property_tax_receipt,
            "khata_certificate": khata_certificate,
            "encumbrance_certificate": encumbrance_certificate,
            "mutation_certificate": mutation_certificate,
            "rtc_document": rtc_document,
            "layout_plan": layout_plan,
            "architectural_drawings": architectural_drawings,
            "structural_certificate": structural_certificate,
            "aadhaar_card": aadhaar_card,
            "pan_card": pan_card,
            "electricity_bill": electricity_bill
        }
        
        for field_name, file in file_fields.items():
            if file:
                file_path = save_file(file, PROPERTY_DIR)
                files[field_name] = file_path
        
        # Create verification request
        verification = {
            "id": ticket_number,
            "citizen": full_name,
            "aadhaar_number": aadhaar_number,
            "contact_number": contact_number,
            "email_id": email_id,
            "permanent_address": permanent_address,
            "files": files,
            "document_type": "Property Papers",
            "ward": "Ward 1",  # This should be determined from address
            "status": "Pending",
            "priority": "Medium",
            "submitted_date": datetime.now().strftime("%Y-%m-%d"),
            "submitted_at": datetime.now().isoformat(),
            "verified_at": None,
            "verified_by": None,
            "verification_notes": None
        }
        
        property_verifications_db.append(verification)
        update_admin_data()
        save_data() # Save data after each property verification submission
        
        return {
            "success": True,
            "message": "Property verification submitted successfully",
            "ticket_number": ticket_number,
            "verification": verification
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit verification: {str(e)}")

@app.get("/api/property/verifications/all")
async def get_all_property_verifications():
    """Get all property verifications (for admin dashboard)"""
    return {
        "success": True,
        "verifications": property_verifications_db,
        "total": len(property_verifications_db)
    }

@app.put("/api/property/verifications/{ticket_id}/verify")
async def verify_property_documents(
    ticket_id: str,
    status: str = Form(...),
    notes: Optional[str] = Form(None),
    verified_by: str = Form(...)
):
    """Verify property documents (for admin use)"""
    verification = next((v for v in property_verifications_db if v["id"] == ticket_id), None)
    
    if not verification:
        raise HTTPException(status_code=404, detail="Verification request not found")
    
    verification["status"] = status
    verification["verified_at"] = datetime.now().isoformat()
    verification["verified_by"] = verified_by
    if notes:
        verification["verification_notes"] = notes
    
    update_admin_data()
    save_data() # Save data after each property verification update
    
    return {
        "success": True,
        "message": "Property verification updated successfully",
        "verification": verification
    }

# Building approval endpoints
@app.post("/api/building/approval")
async def submit_building_approval(
    full_name: str = Form(...),
    aadhaar_number: str = Form(...),
    contact_number: str = Form(...),
    email_id: str = Form(...),
    permanent_address: Optional[str] = Form(None),
    property_address: str = Form(...),
    property_type: str = Form(...),
    land_area: str = Form(...),
    building_purpose: str = Form(...),
    sale_deed: Optional[UploadFile] = File(None),
    layout_plan: Optional[UploadFile] = File(None),
    architectural_drawings: Optional[UploadFile] = File(None),
    structural_certificate: Optional[UploadFile] = File(None),
    soil_test_report: Optional[UploadFile] = File(None),
    building_estimation: Optional[UploadFile] = File(None),
    aadhaar_card: Optional[UploadFile] = File(None),
    pan_card: Optional[UploadFile] = File(None),
    electricity_bill: Optional[UploadFile] = File(None)
):
    """Submit building approval application"""
    try:
        ticket_number = generate_id("BAP")
        
        # Save uploaded files
        files = {}
        file_fields = {
            "sale_deed": sale_deed,
            "layout_plan": layout_plan,
            "architectural_drawings": architectural_drawings,
            "structural_certificate": structural_certificate,
            "soil_test_report": soil_test_report,
            "building_estimation": building_estimation,
            "aadhaar_card": aadhaar_card,
            "pan_card": pan_card,
            "electricity_bill": electricity_bill
        }
        
        for field_name, file in file_fields.items():
            if file:
                file_path = save_file(file, BUILDING_DIR)
                files[field_name] = file_path
        
        # Create building approval request
        approval = {
            "id": ticket_number,
            "applicant": full_name,
            "aadhaar_number": aadhaar_number,
            "contact_number": contact_number,
            "email_id": email_id,
            "permanent_address": permanent_address,
            "property_address": property_address,
            "property_type": property_type,
            "land_area": land_area,
            "building_purpose": building_purpose,
            "files": files,
            "project": f"{property_type} - {building_purpose}",
            "ward": "Ward 1",  # This should be determined from property address
            "status": "Pending",
            "submitted_date": datetime.now().strftime("%Y-%m-%d"),
            "submitted_at": datetime.now().isoformat(),
            "estimated_cost": "₹1.0 Cr",  # This should be calculated or input
            "approved_at": None,
            "approved_by": None,
            "approval_notes": None,
            "rejection_reason": None
        }
        
        building_approvals_db.append(approval)
        update_admin_data()
        save_data() # Save data after each building approval submission
        
        return {
            "success": True,
            "message": "Building approval application submitted successfully",
            "ticket_number": ticket_number,
            "approval": approval
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit building approval: {str(e)}")

@app.get("/api/building/approvals/all")
async def get_all_building_approvals():
    """Get all building approvals (for admin dashboard)"""
    return {
        "success": True,
        "approvals": building_approvals_db,
        "total": len(building_approvals_db)
    }

@app.put("/api/building/approvals/{ticket_id}/approve")
async def approve_building_application(
    ticket_id: str,
    action: str = Form(...),  # "approve" or "reject"
    notes: Optional[str] = Form(None),
    approved_by: str = Form(...),
    rejection_reason: Optional[str] = Form(None)
):
    """Approve or reject building application (for admin use)"""
    approval = next((a for a in building_approvals_db if a["id"] == ticket_id), None)
    
    if not approval:
        raise HTTPException(status_code=404, detail="Building approval request not found")
    
    if action == "approve":
        approval["status"] = "Approved"
        approval["approved_at"] = datetime.now().isoformat()
        approval["approved_by"] = approved_by
        approval["approval_notes"] = notes
    elif action == "reject":
        approval["status"] = "Rejected"
        approval["rejection_reason"] = rejection_reason
        approval["approved_by"] = approved_by
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve' or 'reject'")
    
    update_admin_data()
    save_data() # Save data after each building approval update
    
    return {
        "success": True,
        "message": f"Building application {action}d successfully",
        "approval": approval
    }

# Admin dashboard endpoint
@app.get("/api/admin/dashboard")
async def get_admin_dashboard():
    """Get admin dashboard data with analytics"""
    try:
        # Calculate analytics
        total_surveys = len(surveys_db)
        total_violations = len(illegal_constructions_db)
        total_complaints = len(complaints_db)
        total_property_verifications = len(property_verifications_db)
        total_building_approvals = len(building_approvals_db)
        
        # Survey analytics
        if total_surveys > 0:
            high_severity_violations = len([v for v in illegal_constructions_db if v.get("severity") == "high"])
            medium_severity_violations = len([v for v in illegal_constructions_db if v.get("severity") == "medium"])
            low_severity_violations = len([v for v in illegal_constructions_db if v.get("severity") == "low"])
            
            # Ward-wise violation distribution
            ward_violations = {}
            for violation in illegal_constructions_db:
                ward = violation.get("ward_no", "Unknown")
                ward_violations[ward] = ward_violations.get(ward, 0) + 1
            
            # Recent activity (last 7 days)
            from datetime import datetime, timedelta
            week_ago = datetime.now() - timedelta(days=7)
            recent_surveys = [s for s in surveys_db if datetime.fromisoformat(s["created_at"]) > week_ago]
            recent_violations = [v for v in illegal_constructions_db if datetime.fromisoformat(v["detected_at"]) > week_ago]
            
            survey_analytics = {
                "total_surveys": total_surveys,
                "total_violations": total_violations,
                "severity_breakdown": {
                    "high": high_severity_violations,
                    "medium": medium_severity_violations,
                    "low": low_severity_violations
                },
                "ward_distribution": ward_violations,
                "recent_activity": {
                    "surveys_last_week": len(recent_surveys),
                    "violations_last_week": len(recent_violations)
                },
                "compliance_rate": round(((total_surveys - total_violations) / total_surveys) * 100, 2) if total_surveys > 0 else 0
            }
        else:
            survey_analytics = {
                "total_surveys": 0,
                "total_violations": 0,
                "severity_breakdown": {"high": 0, "medium": 0, "low": 0},
                "ward_distribution": {},
                "recent_activity": {"surveys_last_week": 0, "violations_last_week": 0},
                "compliance_rate": 0
            }
        
        return {
            "success": True,
            "data": {
                "overview": {
                    "total_complaints": total_complaints,
                    "total_property_verifications": total_property_verifications,
                    "total_building_approvals": total_building_approvals,
                    "total_surveys": total_surveys,
                    "total_violations": total_violations
                },
                "surveys": surveys_db,
                "illegal_constructions": illegal_constructions_db,
                "complaints": complaints_db,
                "property_verifications": property_verifications_db,
                "building_approvals": building_approvals_db,
                "analytics": survey_analytics
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch admin dashboard data: {str(e)}")

# Survey endpoints
@app.post("/api/surveys/start")
async def start_survey(
    survey_data: str = Form(...),  # JSON string of survey data
    drone_data_file: Optional[UploadFile] = File(None)
):
    """Start a new survey with drone data analysis"""
    try:
        # Parse survey data
        print(f"Raw survey_data received: {survey_data}")
        survey_json = json.loads(survey_data)
        print(f"Parsed survey_json: {survey_json}")
        print(f"Survey data type: {type(survey_json)}")
        
        # Validate required fields
        required_fields = ["ward_no", "survey_date", "drone_id", "coordinates"]
        for field in required_fields:
            if not survey_json.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Initialize data for detection - default to form data
        data_for_detection = survey_json
        drone_file_path = ""
        
        # If drone data file is provided, use it for detection
        if drone_data_file:
            # Read the drone data file content
            await drone_data_file.seek(0)  # Reset file pointer
            file_content_bytes = await drone_data_file.read()
            
            # Reset file pointer again for saving
            await drone_data_file.seek(0)
            drone_file_path = save_file(drone_data_file, UPLOAD_DIR / "surveys")
            
            try:
                # Parse the drone data file as JSON
                parsed_drone_data = json.loads(file_content_bytes.decode('utf-8'))
                
                # Use drone data for detection instead of form data
                data_for_detection = parsed_drone_data
                
                # Merge essential metadata from form if not present in drone data
                if "ward_no" not in data_for_detection:
                    data_for_detection["ward_no"] = survey_json.get("ward_no")
                if "survey_date" not in data_for_detection:
                    data_for_detection["survey_date"] = survey_json.get("survey_date")
                if "drone_id" not in data_for_detection:
                    data_for_detection["drone_id"] = survey_json.get("drone_id")
                if "coordinates" not in data_for_detection:
                    data_for_detection["coordinates"] = survey_json.get("coordinates")
                    
            except json.JSONDecodeError:
                print(f"Warning: Drone data file '{drone_data_file.filename}' is not a valid JSON. Using form data for detection.")
                data_for_detection = survey_json
            except Exception as e:
                print(f"Error processing drone data file: {e}. Using form data for detection.")
                data_for_detection = survey_json
        
        # Enhanced building regulations with more zones
        regulations = {
            "city": "Indore",
            "year": 2025,
            "zones": {
                "residential": {
                    "zone_code": "RES",
                    "building_regulations": {
                        "building_height_limit_meters": 18,
                        "max_floors": 5,
                        "floor_area_ratio": 1.5,
                        "setbacks": {
                            "front_setback_meters": 3,
                            "rear_setback_meters": 2,
                            "side_setback_meters": 1.5
                        },
                        "land_use": "Residential",
                        "road_width_minimum_meters": 9,
                        "parking_requirement": {
                            "car": "1 per 75 sq.m builtup area",
                            "two_wheeler": "1 per 40 sq.m builtup area"
                        }
                    },
                    "special_restrictions": {
                        "basement_usage": "Only for parking, not for commercial",
                        "rooftop_construction": "Allowed only for utilities (water tank, solar panel)",
                        "green_area_minimum_percent": 10
                    }
                },
                "commercial": {
                    "zone_code": "COM",
                    "building_regulations": {
                        "building_height_limit_meters": 30,
                        "max_floors": 8,
                        "floor_area_ratio": 2.5,
                        "setbacks": {
                            "front_setback_meters": 5,
                            "rear_setback_meters": 3,
                            "side_setback_meters": 2
                        },
                        "land_use": "Commercial",
                        "road_width_minimum_meters": 12,
                        "parking_requirement": {
                            "car": "1 per 50 sq.m builtup area",
                            "two_wheeler": "1 per 30 sq.m builtup area"
                        }
                    },
                    "special_restrictions": {
                        "basement_usage": "Allowed for parking + storage (not retail)",
                        "rooftop_construction": "Allowed for utilities and solar panel only",
                        "green_area_minimum_percent": 5
                    }
                },
                "industrial": {
                    "zone_code": "IND",
                    "building_regulations": {
                        "building_height_limit_meters": 25,
                        "max_floors": 6,
                        "floor_area_ratio": 2.0,
                        "setbacks": {
                            "front_setback_meters": 8,
                            "rear_setback_meters": 5,
                            "side_setback_meters": 4
                        },
                        "land_use": "Industrial",
                        "road_width_minimum_meters": 15,
                        "parking_requirement": {
                            "car": "1 per 100 sq.m builtup area",
                            "two_wheeler": "1 per 50 sq.m builtup area"
                        }
                    },
                    "special_restrictions": {
                        "basement_usage": "Allowed for storage and utilities",
                        "rooftop_construction": "Allowed for utilities and solar panel",
                        "green_area_minimum_percent": 8
                    }
                },
                "mixed": {
                    "zone_code": "MIX",
                    "building_regulations": {
                        "building_height_limit_meters": 24,
                        "max_floors": 7,
                        "floor_area_ratio": 2.2,
                        "setbacks": {
                            "front_setback_meters": 4,
                            "rear_setback_meters": 3,
                            "side_setback_meters": 2.5
                        },
                        "land_use": "Mixed Use",
                        "road_width_minimum_meters": 10,
                        "parking_requirement": {
                            "car": "1 per 60 sq.m builtup area",
                            "two_wheeler": "1 per 35 sq.m builtup area"
                        }
                    },
                    "special_restrictions": {
                        "basement_usage": "Allowed for parking and storage",
                        "rooftop_construction": "Allowed for utilities and solar panel",
                        "green_area_minimum_percent": 7
                    }
                }
            }
        }
        
        # Enhanced illegal construction detection using the appropriate data source
        print(f"Data for detection before calling detect_illegal_constructions: {data_for_detection}")
        print(f"Data type: {type(data_for_detection)}")
        try:
            violations = detect_illegal_constructions(data_for_detection, regulations)
        except Exception as e:
            print(f"Error in detect_illegal_constructions: {e}")
            print(f"Data for detection: {data_for_detection}")
            violations = []
        
        # Calculate comprehensive analytics
        total_buildings = len(data_for_detection.get("buildings", []))
        total_roads = len(data_for_detection.get("roads", []))
        
        # Convert string values to float for area calculations with error handling
        land_usage = data_for_detection.get("land_usage", {})
        try:
            total_area = sum([
                float(land_usage.get("residential_area_sq_meters", 0) or 0),
                float(land_usage.get("commercial_area_sq_meters", 0) or 0),
                float(land_usage.get("industrial_area_sq_meters", 0) or 0)
            ])
        except (ValueError, TypeError):
            total_area = 0
        
        # Create survey record with enhanced data
        survey_id = generate_id("SUR")
        survey = {
            "id": survey_id,
            "survey_data": survey_json,
            "drone_file_path": drone_file_path,
            "drone_data_used": data_for_detection,  # Store the actual data used for detection
            "violations": violations,
            "regulations_used": regulations,
            "status": "completed",
            "created_at": datetime.now().isoformat(),
            "ward_no": data_for_detection.get("ward_no", survey_json.get("ward_no")),
            "survey_date": data_for_detection.get("survey_date", survey_json.get("survey_date")),
            "drone_id": data_for_detection.get("drone_id", survey_json.get("drone_id")),
            "coordinates": data_for_detection.get("coordinates", survey_json.get("coordinates")),
            "total_violations": len(violations),
            "total_buildings": total_buildings,
            "total_roads": total_roads,
            "total_area_sq_meters": total_area,
            "severity_summary": {
                "high": len([v for v in violations if v.get("severity") == "high"]),
                "medium": len([v for v in violations if v.get("severity") == "medium"]),
                "low": len([v for v in violations if v.get("severity") == "low"])
            },
            "compliance_score": round(((total_buildings + total_roads - len(violations)) / (total_buildings + total_roads)) * 100, 2) if (total_buildings + total_roads) > 0 else 100,
            "ward_name": f"Ward {data_for_detection.get('ward_no', survey_json.get('ward_no'))}",
            "incharge_id": survey_json.get("incharge_id", "Unknown"),
            "survey_type": "Field Survey with Drone Data" if drone_data_file else "Manual Field Survey"
        }
        
        surveys_db.append(survey)
        
        # Create detailed illegal construction records for admin
        for violation in violations:
            illegal_construction = {
                "id": generate_id("ILL"),
                "survey_id": survey_id,
                "building_id": violation.get("building_id"),
                "road_id": violation.get("road_id"),
                "violation_type": violation.get("type"),
                "current_value": violation.get("current"),
                "allowed_value": violation.get("allowed"),
                "severity": violation.get("severity"),
                "ward_no": data_for_detection.get("ward_no", survey_json.get("ward_no")),
                "ward_name": f"Ward {data_for_detection.get('ward_no', survey_json.get('ward_no'))}",
                "coordinates": data_for_detection.get("coordinates", survey_json.get("coordinates")),
                "detected_at": datetime.now().isoformat(),
                "status": "detected",
                "action_required": True,
                "priority": "high" if violation.get("severity") == "high" else "medium" if violation.get("severity") == "medium" else "low",
                "estimated_resolution_days": 30 if violation.get("severity") == "high" else 60 if violation.get("severity") == "medium" else 90
            }
            illegal_constructions_db.append(illegal_construction)
        
        update_admin_data()
        save_data() # Save data after each survey completion
        
        return {
            "success": True,
            "message": "Survey completed successfully with comprehensive analysis",
            "survey_id": survey_id,
            "survey": survey,
            "violations_detected": len(violations),
            "severity_breakdown": survey["severity_summary"],
            "compliance_score": survey["compliance_score"],
            "total_buildings_analyzed": total_buildings,
            "total_roads_analyzed": total_roads,
            "total_area_covered": total_area
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process survey: {str(e)}")

@app.get("/api/surveys/{survey_id}")
async def get_survey(survey_id: str):
    """Get survey details by ID"""
    survey = next((s for s in surveys_db if s["id"] == survey_id), None)
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    
    return {
        "success": True,
        "survey": survey
    }

@app.get("/api/surveys/all")
async def get_all_surveys():
    """Get all surveys (for admin dashboard)"""
    return {
        "success": True,
        "surveys": surveys_db,
        "total": len(surveys_db)
    }

@app.get("/api/illegal-constructions/all")
async def get_all_illegal_constructions():
    """Get all illegal constructions (for admin dashboard)"""
    return {
        "success": True,
        "illegal_constructions": illegal_constructions_db,
        "total": len(illegal_constructions_db)
    }

@app.put("/api/illegal-constructions/{violation_id}/status")
async def update_violation_status(
    violation_id: str,
    status: str = Form(...),
    action_taken: str = Form(...),
    officer_name: str = Form(...),
    notes: Optional[str] = Form(None)
):
    """Update illegal construction violation status"""
    violation = next((v for v in illegal_constructions_db if v["id"] == violation_id), None)
    
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    violation["status"] = status
    violation["action_taken"] = action_taken
    violation["officer_name"] = officer_name
    violation["notes"] = notes
    violation["updated_at"] = datetime.now().isoformat()
    
    update_admin_data()
    save_data() # Save data after each violation status update
    
    return {
        "success": True,
        "message": "Violation status updated successfully",
        "violation": violation
    }

# Illegal construction status update endpoint
@app.put("/api/illegal-constructions/{violation_id}/status")
async def update_illegal_construction_status(
    violation_id: str,
    status: str = Form(...),
    message: str = Form(...),
    officer: str = Form(...),
    action_taken: str = Form(...)
):
    """Update illegal construction violation status"""
    try:
        # Find the violation
        violation = next((v for v in illegal_constructions_db if v["id"] == violation_id), None)
        
        if not violation:
            raise HTTPException(status_code=404, detail="Violation not found")
        
        # Update status
        violation["status"] = status
        violation["last_updated"] = datetime.now().isoformat()
        violation["updated_by"] = officer
        violation["action_taken"] = action_taken
        
        # Add update to timeline
        if "updates" not in violation:
            violation["updates"] = []
        
        update_entry = {
            "date": datetime.now().isoformat(),
            "status": status,
            "message": message,
            "officer": officer,
            "action": action_taken
        }
        violation["updates"].append(update_entry)
        
        # Update resolved_at if status is resolved
        if status == "resolved":
            violation["resolved_at"] = datetime.now().isoformat()
        
        update_admin_data()
        save_data()
        
        return {
            "success": True,
            "message": "Violation status updated successfully",
            "violation": violation
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update violation status: {str(e)}")

# File download endpoint
@app.get("/uploads/{file_path:path}")
async def download_file(file_path: str):
    """Download uploaded files"""
    file_location = UPLOAD_DIR / file_path
    
    if not file_location.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_location)

# User endpoints for property verifications and building approvals
@app.get("/api/property/user/{user_contact}")
async def get_user_property_verifications(user_contact: str):
    """Get all property verifications for a specific user (by contact number)"""
    user_verifications = [v for v in property_verifications_db if v.get("contact_number") == user_contact]
    
    return {
        "success": True,
        "verifications": user_verifications,
        "total": len(user_verifications)
    }

@app.get("/api/building/user/{user_contact}")
async def get_user_building_approvals(user_contact: str):
    """Get all building approvals for a specific user (by contact number)"""
    user_approvals = [a for a in building_approvals_db if a.get("contact_number") == user_contact]
    
    return {
        "success": True,
        "approvals": user_approvals,
        "total": len(user_approvals)
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "total_complaints": len(complaints_db),
        "total_property_verifications": len(property_verifications_db),
        "total_building_approvals": len(building_approvals_db),
        "total_surveys": len(surveys_db),
        "total_illegal_constructions": len(illegal_constructions_db)
    }

# Test endpoint to add a sample complaint
@app.post("/api/test/add-complaint")
async def add_test_complaint():
    """Add a test complaint for testing purposes"""
    try:
        complaint_id = generate_id("GRV")
        
        # Create test complaint
        test_complaint = {
            "id": complaint_id,
            "title": "Test Complaint - Street Light Issue",
            "description": "Street light not working in front of house",
            "category": "Street Lighting",
            "incident_date": datetime.now().strftime("%Y-%m-%d"),
            "incident_time": "18:00",
            "address": "123 Test Street, Indore",
            "ward": "Ward 1",
            "zone": "North Zone",
            "latitude": "22.7196",
            "longitude": "75.8577",
            "landmark": "Near Test Market",
            "complainant": {
                "full_name": "Test User",
                "father_name": "Test Father",
                "mother_name": "Test Mother",
                "date_of_birth": "1990-01-01",
                "gender": "male",
                "contact_number": "9876543210",
                "residential_address": "123 Test Street, Indore",
                "permanent_address": "123 Test Street, Indore",
                "id_proof_type": "Aadhaar Card",
                "id_proof_number": "123456789012"
            },
            "files": {
                "photos": [],
                "videos": [],
                "documents": [],
                "id_proof": "",
                "selfie": ""
            },
            "status": "New",
            "priority": "Medium",
            "submitted_at": datetime.now().isoformat(),
            "updates": [
                {
                    "date": datetime.now().isoformat(),
                    "status": "New",
                    "message": "Test complaint registered successfully",
                    "officer": "System"
                }
            ],
            "assigned_to": None,
            "officer": None,
            "contact": None,
            "estimated_resolution": None,
            "resolved_at": None
        }
        
        complaints_db.append(test_complaint)
        update_admin_data()
        save_data()
        
        print(f"Test complaint added: {complaint_id}")
        
        return {
            "success": True,
            "message": "Test complaint added successfully",
            "complaint_id": complaint_id,
            "total_complaints": len(complaints_db)
        }
        
    except Exception as e:
        print(f"Error adding test complaint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to add test complaint: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
