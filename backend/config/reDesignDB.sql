-- ===========================
-- CREATE DATABASE
-- ===========================
CREATE DATABASE admission_db1;
USE admission_db1;

-- ===========================
-- COURSES
-- ===========================
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    fees DECIMAL(10, 2) NOT NULL,
    duration VARCHAR(100),
    eligibility TEXT,
    fees_link TEXT,
    brochure_link TEXT,
    brochure_name TEXT,
    apply_link TEXT,
    apply_name TEXT
);

CREATE INDEX idx_courses_name ON courses(name);

-- ===========================
-- COURSE DETAILS
-- ===========================
CREATE TABLE course_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    program TEXT,
    fees DECIMAL(10, 2),
    eligibility TEXT,
    CONSTRAINT fk_course_details 
        FOREIGN KEY (course_id) REFERENCES courses(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_course_details_course_id ON course_details(course_id);

-- ===========================
-- COURSE SEATS
-- ===========================
CREATE TABLE course_seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    seats INT NOT NULL,
    CONSTRAINT fk_course_seats 
        FOREIGN KEY (course_id) REFERENCES courses(id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_course_seats_course_id ON course_seats(course_id);

-- ===========================
-- USERS
-- ===========================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_no VARCHAR(20) NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ===========================
-- PERSONAL INFO
-- ===========================
CREATE TABLE personal_info (
    student_id VARCHAR(20) PRIMARY KEY, -- e.g., STU-000001
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
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

-- ===========================
-- ACADEMIC INFO
-- ===========================
CREATE TABLE academic_info (
    academic_id VARCHAR(40) PRIMARY KEY, -- e.g., ACAD-000001
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
    CONSTRAINT fk_academic_info 
        FOREIGN KEY (student_id) REFERENCES personal_info(student_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_academic_info_student_id ON academic_info(student_id);

-- ===========================
-- EXTRA INFO
-- ===========================
CREATE TABLE extra_info (
    student_id VARCHAR(20) PRIMARY KEY,
    physically_challenged VARCHAR(50),
    ex_serviceman VARCHAR(50),
    activities TEXT,
    CONSTRAINT fk_extra_info 
        FOREIGN KEY (student_id) REFERENCES personal_info(student_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===========================
-- ADMISSION RECORDS
-- ===========================
CREATE TABLE admission_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admission_id VARCHAR(50) NOT NULL UNIQUE,
    student_id VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    admission_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    application_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    CONSTRAINT fk_admission_records 
        FOREIGN KEY (student_id) REFERENCES personal_info(student_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_admission_records_student_id ON admission_records(student_id);

-- ===========================
-- ADMIN USERS
-- ===========================
CREATE TABLE admin_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_email ON admin_users(email);

-- ===========================
-- SAMPLE ADMIN USER
-- ===========================
INSERT INTO admin_users (email, password)
VALUES (
  'admin1234@gmail.com',
  '$2b$10$cWaZqrg.Pzfw7MZEmlng9un4rRiSxWeEvveCQ7wVTL.dpxAxkvT4e'
);

-- ===========================
-- Insert Courses
-- ===========================
INSERT INTO courses (name, fees, duration, eligibility, fees_link, brochure_link, brochure_name, apply_link, apply_name)
VALUES
('Computer Science and Engineering', 250000.00, '4 years', '12th with Physics, Chemistry, Mathematics', 'http://example.com/fees-cse', 'http://example.com/brochure-cse.pdf', 'CSE Brochure', 'http://example.com/apply-cse', 'Apply Now'),
('Mechanical Engineering', 220000.00, '4 years', '12th with Physics, Chemistry, Mathematics', 'http://example.com/fees-mech', 'http://example.com/brochure-mech.pdf', 'MECH Brochure', 'http://example.com/apply-mech', 'Apply Now'),
('Civil Engineering', 200000.00, '4 years', '12th with Physics, Chemistry, Mathematics', 'http://example.com/fees-civil', 'http://example.com/brochure-civil.pdf', 'CIVIL Brochure', 'http://example.com/apply-civil', 'Apply Now'),
('Electrical and Electronics Engineering', 210000.00, '4 years', '12th with Physics, Chemistry, Mathematics', 'http://example.com/fees-eee', 'http://example.com/brochure-eee.pdf', 'EEE Brochure', 'http://example.com/apply-eee', 'Apply Now'),
('Information Technology', 240000.00, '4 years', '12th with Physics, Chemistry, Mathematics', 'http://example.com/fees-it', 'http://example.com/brochure-it.pdf', 'IT Brochure', 'http://example.com/apply-it', 'Apply Now');

-- ===========================
-- Insert Course Details (Programs under each Course)
-- ===========================
INSERT INTO course_details (course_id, program, fees, eligibility)
VALUES
(1, 'B.Tech CSE (AI & ML)', 260000.00, '12th with PCM + Entrance Exam'),
(1, 'B.Tech CSE (Cybersecurity)', 255000.00, '12th with PCM + Entrance Exam'),
(2, 'B.Tech Mechanical (Automobile)', 225000.00, '12th with PCM'),
(3, 'B.Tech Civil (Structural Engineering)', 205000.00, '12th with PCM'),
(4, 'B.Tech EEE (Power Systems)', 215000.00, '12th with PCM'),
(5, 'B.Tech IT (Data Science)', 245000.00, '12th with PCM');

-- ===========================
-- Insert Course Seats
-- ===========================
INSERT INTO course_seats (course_id, seats)
VALUES
(1, 120),  -- CSE
(2, 90),   -- Mechanical
(3, 80),   -- Civil
(4, 70),   -- EEE
(5, 100);  -- IT

