-- ======================
-- CREATE DATABASE
-- ======================
CREATE DATABASE IF NOT EXISTS admission_db;
USE admission_db;

-- ======================
-- COURSES (Updated Main Table)
-- ======================
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- Added course code (e.g., "CS101")
    description TEXT,
    duration VARCHAR(100) NOT NULL,
    duration_type ENUM('years', 'months', 'semesters') DEFAULT 'years',
    total_fees DECIMAL(12, 2) NOT NULL,
    eligibility_criteria TEXT,
    intake_capacity INT DEFAULT 0,
    current_seats_available INT DEFAULT 0,
    brochure_url TEXT,
    application_url TEXT,
    fees_structure_url TEXT,
    status ENUM('active', 'inactive', 'upcoming') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_name ON courses(name);
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_courses_status ON courses(status);

-- ======================
-- COURSE_FEE_STRUCTURE (Replaces course_details)
-- ======================
CREATE TABLE course_fee_structure (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    fee_type ENUM('tuition', 'hostel', 'mess', 'library', 'laboratory', 'other') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    frequency ENUM('one_time', 'per_semester', 'per_year', 'per_month') DEFAULT 'per_semester',
    description TEXT,
    CONSTRAINT fk_fee_structure_course FOREIGN KEY (course_id) 
        REFERENCES courses(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_fee_structure_course_id ON course_fee_structure(course_id);

-- ======================
-- COURSE_SEAT_ALLOCATION (Enhanced course_seats)
-- ======================
CREATE TABLE course_seat_allocation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    category ENUM('general', 'sc', 'st', 'obc', 'ews', 'pwd', 'other') DEFAULT 'general',
    total_seats INT NOT NULL DEFAULT 0,
    seats_available INT NOT NULL DEFAULT 0,
    academic_year YEAR NOT NULL,
    CONSTRAINT fk_seat_allocation_course FOREIGN KEY (course_id) 
        REFERENCES courses(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_seat_allocation_course_id ON course_seat_allocation(course_id);
CREATE INDEX idx_seat_allocation_year ON course_seat_allocation(academic_year);

-- ======================
-- COURSE_SPECIALIZATIONS (New Table)
-- ======================
CREATE TABLE course_specializations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    specialization_name VARCHAR(255) NOT NULL,
    description TEXT,
    credits_required INT DEFAULT 0,
    CONSTRAINT fk_specializations_course FOREIGN KEY (course_id) 
        REFERENCES courses(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_specializations_course_id ON course_specializations(course_id);

-- ======================
-- USERS (Unchanged)
-- ======================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_no VARCHAR(20) NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);

-- ======================
-- PERSONAL INFO (Unchanged)
-- ======================
CREATE TABLE personal_info (
    student_id VARCHAR(20) PRIMARY KEY, -- e.g., STU-000001
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    aadhaar_number VARCHAR(20) NOT NULL UNIQUE,
    blood_group VARCHAR(5),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    father_name VARCHAR(100),
    father_occupation VARCHAR(100),
    mother_name VARCHAR(100),
    mother_occupation VARCHAR(100),
    annual_income DECIMAL(15, 2),
    community VARCHAR(50),
    caste VARCHAR(50),
    religion VARCHAR(50),
    nationality VARCHAR(50)
);
CREATE INDEX idx_personal_info_email ON personal_info(email);

-- ======================
-- ACADEMIC INFO (Unchanged)
-- ======================
CREATE TABLE academic_info (
    academic_id VARCHAR(20) PRIMARY KEY, -- e.g., ACAD-000001
    student_id VARCHAR(20) NOT NULL,
    school_name VARCHAR(255),
    exam_register_number VARCHAR(100),
    emis_no VARCHAR(100),
    subjects JSON,
    total_marks INT,
    mark_percentage DECIMAL(5, 2),
    cutoff_marks DECIMAL(5, 2),
    month_year_passing VARCHAR(10), -- e.g., MM-YYYY
    course_type VARCHAR(50),
    course_name VARCHAR(100),
    course_mode VARCHAR(50),
    passport_photo LONGBLOB,
    aadhaar_card LONGBLOB,
    transfer_certificate LONGBLOB,
    CONSTRAINT fk_academic_info FOREIGN KEY (student_id) 
        REFERENCES personal_info(student_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_academic_info_student_id ON academic_info(student_id);

-- ======================
-- EXTRA INFO (Unchanged)
-- ======================
CREATE TABLE extra_info (
    student_id VARCHAR(20) PRIMARY KEY,
    physically_challenged VARCHAR(50),
    ex_serviceman VARCHAR(50),
    activities TEXT,
    CONSTRAINT fk_extra_info FOREIGN KEY (student_id) 
        REFERENCES personal_info(student_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ======================
-- ADMISSION RECORDS (Unchanged)
-- ======================
CREATE TABLE admission_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admission_id VARCHAR(20) NOT NULL UNIQUE,
    student_id VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    admission_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    CONSTRAINT fk_admission_records FOREIGN KEY (student_id) 
        REFERENCES personal_info(student_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX idx_admission_records_student_id ON admission_records(student_id);

-- ======================
-- ADMIN USERS (Unchanged)
-- ======================
CREATE TABLE admin_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_admin_users_email ON admin_users(email);
