-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 14, 2024 at 10:32 PM
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
-- Database: `paymaster`
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
-- Table structure for table `Employee`
--

CREATE TABLE `Employee` (
  `EmployeeID` int(11) NOT NULL,
  `FirstName` varchar(50) NOT NULL DEFAULT 'Unknown',
  `LastName` varchar(50) NOT NULL DEFAULT 'Unknown',
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Employee`
--

INSERT INTO `Employee` (`EmployeeID`, `FirstName`, `LastName`, `email`, `password`) VALUES
(1, 'Wanja', 'Muriithi', '', ''),
(2, 'John', 'Njenga', '', ''),
(3, 'Aisha', 'Abdalla', '', ''),
(4, 'David', 'Ochieng', '', ''),
(5, 'Unknown', 'Unknown', 'nyagakavera@gmail.com', '$2b$10$esR.dCPUEDKEv1Oux2XLgOT2motkXBNVuUBGk.vU7o5jCrooXcDtW');

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
(1, 'Wanja', 'Muriithi', 'HR Manager', 'Human Resources', 'wanja.muriithi@example.com', 'Wanja is dedicated to managing and developing our human resources.', 'profile-picture-wanja.jpg'),
(2, 'John', 'Njenga', 'Data Analyst', 'Data Department', 'john.njenga@example.com', 'John is a data analyst with a knack for uncovering insights from data.', 'profile-picture-john.jpg'),
(3, 'Aisha', 'Abdalla', 'Project Manager', 'Operations', 'aisha.abdalla@example.com', 'Aisha is an experienced project manager who excels in leading cross-functional teams.', 'profile-picture-aisha.jpg'),
(4, 'David', 'Ochieng', 'Software Engineer', 'IT Department', 'david.ochieng@example.com', 'David is a skilled software engineer with over 5 years of experience.', 'profile-picture-david.jpg');

--
-- Indexes for dumped tables
--

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Employee`
--
ALTER TABLE `Employee`
  MODIFY `EmployeeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employee_profile`
--
ALTER TABLE `employee_profile`
  MODIFY `employeeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employee_profile`
--
ALTER TABLE `employee_profile`
  ADD CONSTRAINT `employee_profile_ibfk_1` FOREIGN KEY (`employeeID`) REFERENCES `Employee` (`EmployeeID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
