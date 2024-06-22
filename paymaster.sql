-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 19, 2024 at 10:46 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bevv9lcxzjw1b3cabwrt`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `username` varchar(20) NOT NULL,
  `email` varchar(30) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`username`, `email`, `password`) VALUES
('vera', 'vera.nyagaka@strathmore.edu', '$2b$10$sjajVxrQTkFYdfJJyqGJW.3.pDqlMAaQsJTl2nJBmfqqJOzHk/SH.');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `record_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `week_start` date NOT NULL,
  `hours_worked` decimal(5,2) NOT NULL,
  `overtime_hours` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance_reports`
--

CREATE TABLE `attendance_reports` (
  `report_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `report_date` date NOT NULL,
  `total_hours` decimal(5,2) NOT NULL,
  `total_overtime_hours` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `Employee`
--

CREATE TABLE `Employee` (
  `EmployeeID` int(11) NOT NULL,
  `FirstName` varchar(50) NOT NULL DEFAULT 'Unknown',
  `LastName` varchar(50) NOT NULL DEFAULT 'Unknown',
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL DEFAULT '123'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Employee`
--

INSERT INTO `Employee` (`EmployeeID`, `FirstName`, `LastName`, `email`, `password`) VALUES
(3, 'Aisha', 'Abdalla', '', ''),
(4, 'David', 'Ochieng', '', ''),
(5, 'Unknown', 'Unknown', 'nyagakavera@gmail.com', '$2b$10$esR.dCPUEDKEv1Oux2XLgOT2motkXBNVuUBGk.vU7o5jCrooXcDtW'),
(6, 'gs', 'gg', 'gs', '123');

-- --------------------------------------------------------

--
-- Table structure for table `employee_profile`
--

CREATE TABLE `employee_profile` (
  `employeeID` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_profile`
--

INSERT INTO `employee_profile` (`employeeID`, `first_name`, `last_name`, `job_title`, `department`, `email`, `bio`, `profile_picture`) VALUES
(3, 'ffa', 'Abdalla', 'gs', 'gg', 'aisha.abdalla@example.com', 'Aisha is an experienced project manager who excels in leading cross-functional teams.', 'profile-picture-aisha.jpg'),
(4, 'David', 'Ochieng', 'Software Engineer', 'IT Department', 'david.ochieng@example.com', 'David is a skilled software engineer with over 5 years of experience.', 'profile-picture-david.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `kenyan_salary_structure`
--

CREATE TABLE `kenyan_salary_structure` (
  `id` int(11) NOT NULL,
  `grade` varchar(10) NOT NULL,
  `min_salary` decimal(10,2) NOT NULL,
  `max_salary` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kenyan_salary_structure`
--

INSERT INTO `kenyan_salary_structure` (`id`, `grade`, `min_salary`, `max_salary`) VALUES
(1, 'KLR 1', 152060.00, 302980.00),
(2, 'KLR 2', 120270.00, 180660.00),
(3, 'KLR 3', 109089.00, 144928.00),
(4, 'KLR 4', 89748.00, 120270.00),
(5, 'KLR 5', 77527.00, 103894.00),
(6, 'KLR 6', 47272.00, 63492.00),
(7, 'KLR 7', 35275.00, 47272.00),
(8, 'KLR 8', 30472.00, 42877.00),
(9, 'KLR 9', 26323.00, 35275.00);

-- --------------------------------------------------------

--
-- Table structure for table `kenyan_tax_brackets`
--

CREATE TABLE `kenyan_tax_brackets` (
  `id` int(11) NOT NULL,
  `min_income` decimal(10,2) NOT NULL,
  `max_income` decimal(20,2) NOT NULL,
  `tax_rate` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kenyan_tax_brackets`
--

INSERT INTO `kenyan_tax_brackets` (`id`, `min_income`, `max_income`, `tax_rate`) VALUES
(1, 0.00, 24000.00, 10.00),
(2, 24000.01, 32333.00, 25.00),
(3, 32333.01, 999999999.00, 30.00);

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `request_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `leave_type` enum('Vacation','Sick','Sabbatical','Other') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('Pending','Approved','Denied') DEFAULT 'Pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `attendance_reports`
--
ALTER TABLE `attendance_reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `Employee`
--
ALTER TABLE `Employee`
  ADD PRIMARY KEY (`EmployeeID`);

--
-- Indexes for table `employee_profile`
--
ALTER TABLE `employee_profile`
  ADD PRIMARY KEY (`employeeID`);

--
-- Indexes for table `kenyan_salary_structure`
--
ALTER TABLE `kenyan_salary_structure`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `grade` (`grade`);

--
-- Indexes for table `kenyan_tax_brackets`
--
ALTER TABLE `kenyan_tax_brackets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `record_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance_reports`
--
ALTER TABLE `attendance_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Employee`
--
ALTER TABLE `Employee`
  MODIFY `EmployeeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `employee_profile`
--
ALTER TABLE `employee_profile`
  MODIFY `employeeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `kenyan_salary_structure`
--
ALTER TABLE `kenyan_salary_structure`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `kenyan_tax_brackets`
--
ALTER TABLE `kenyan_tax_brackets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `Employee` (`EmployeeID`);

--
-- Constraints for table `attendance_reports`
--
ALTER TABLE `attendance_reports`
  ADD CONSTRAINT `attendance_reports_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `Employee` (`EmployeeID`);

--
-- Constraints for table `employee_profile`
--
ALTER TABLE `employee_profile`
  ADD CONSTRAINT `employee_profile_ibfk_1` FOREIGN KEY (`employeeID`) REFERENCES `Employee` (`EmployeeID`) ON DELETE CASCADE;

--
-- Constraints for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `leave_requests_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `Employee` (`EmployeeID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
