-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 17, 2025 at 03:47 PM
-- Server version: 8.0.40
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `platoonnew`
--

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `empId` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `department` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `bloodGroup` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `personalEmail` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `officialEmail` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `personalPhone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `emergencyContact` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `joiningDate` date DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `salary` decimal(12,2) DEFAULT '0.00',
  `wotAllowance` tinyint(1) DEFAULT '1',
  `exitDate` date DEFAULT NULL,
  `accountNumber` varchar(64) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ifsc` varchar(32) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pan` varchar(32) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `aadhar` varchar(32) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('active','inactive','probation') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `name`, `empId`, `department`, `bloodGroup`, `personalEmail`, `officialEmail`, `personalPhone`, `emergencyContact`, `joiningDate`, `dob`, `salary`, `wotAllowance`, `exitDate`, `accountNumber`, `ifsc`, `pan`, `aadhar`, `status`, `created_at`, `updated_at`) VALUES
(32, 'Isac Danial S', 'PLA0051', '', 'B+', 'btsdani420@gmail.com', '', '+91-9876543210', '+91-9876500001', '1970-01-01', '1970-01-01', 170000.00, 1, NULL, '4.2269E+12', 'HDFC0001242', 'ABCDE1234F', '9.47645E+12', 'active', '2025-09-11 16:46:59', '2025-09-11 16:46:59'),
(34, 'Ravi Kumar', 'E001', 'IT', 'B+', 'ravi.kumar@gmail.com', 'ravi.kumar@platoontitleservices.com', '9876543210', '9123456780', '2023-01-15', '1990-05-12', 55000.00, 1, NULL, '123456789012', 'HDFC0001234', 'ABCDE1234F', '123412341234', 'active', '2025-09-11 17:56:44', '2025-09-11 17:56:44'),
(35, 'Anita Sharma', 'E002', 'HR', 'O+', 'anita.sharma@gmail.com', 'anita.sharma@platoontitleservices.com', '9876501234', '9988776655', '2022-11-01', '1992-03-20', 48000.00, 0, NULL, '987654321098', 'ICIC0005678', 'XYZAB5678P', '567856785678', 'active', '2025-09-11 17:56:44', '2025-09-11 17:56:44'),
(36, 'Mohammed Ali', 'E003', 'Finance', 'A+', 'mohammed.ali@gmail.com', 'mohammed.ali@platoontitleservices.com', '9876001234', '9000000001', '2021-06-20', '1988-08-10', 60000.00, 1, NULL, '111122223333', 'SBI0001111', 'PQRSX1234Z', '999988887777', 'probation', '2025-09-11 17:56:44', '2025-09-11 17:56:44'),
(40, 'Manikandan', 'PLA0049', 'IT', 'B+', 'mani@gmail.com', 'maniplatoon@gmail.com', '89585958', '748995859', '2025-09-08', '2000-06-04', 16000.00, 1, NULL, '45678888888888889', 'Ifcs456', 'tfuy8798', '123456789', 'active', '2025-09-11 20:40:46', '2025-09-11 20:40:46'),
(45, 'guru', 'PLA0034', 'HR', 'B+', 'mani@gmail.com', 'guru@gmail.com', 'Guru@gmail.com', '8989898909', '2025-09-07', '2000-06-04', 19000.00, 1, NULL, '1234567890989', 'HDFC000123', 'FYKPM3814A', '123456789018', 'active', '2025-09-11 20:46:54', '2025-09-11 20:46:54'),
(49, 'Prakash RK', 'PLA0082', 'IT', 'A+', 'prakash@gmail.com', 'prakashPLatoon@gmail.com', '908000089', '68778998', '2026-09-09', '2000-04-06', 16000.00, 1, NULL, '1233456789876', 'HDFC0001234', 'FYKPM8913A', '123456789011', 'active', '2025-09-15 19:17:57', '2025-09-15 19:17:57'),
(50, 'Sneha Nair J', 'PT-002', 'QA', 'O+', 'sneha.nair@example.com', 'sneha.n@platoontitleservices.com', '+91-9898989898', '+91-9898900002', '2022-11-01', '1993-07-20', 55000.00, 1, NULL, '998877665544', 'ICIC0005678', 'BCDEA2345G', '567856785678', 'active', '2025-09-15 19:59:49', '2025-09-15 19:59:49'),
(51, 'Aarav Kumar K', 'PT-001', 'Operations', 'B+', 'aarav.kumar@example.com', 'aarav.k@platoontitleservices.com', '+91-9876543210', '+91-9876500001', '2023-06-15', '1994-02-11', 50000.00, 1, NULL, '123456789012', 'HDFC0001234', 'ABCDE1234F', '123412341234', 'active', '2025-09-15 20:02:54', '2025-09-15 20:02:54'),
(55, 'Rahul Singh m', 'PT-003', 'IT', 'A+', 'rahul.singh@example.com', 'rahul.s@platoontitleservices.com', '+91-9000000001', '+91-9000001000', '2024-02-10', '1996-12-05', 60000.00, 1, NULL, '445566778899', 'SBIN0001111', 'CDEFG3456H', '901290129012', 'active', '2025-09-15 20:16:49', '2025-09-15 20:16:49'),
(57, 'manish', 'pla009', 'it', 'A+', 'mani@gmail.com', 'maniplatoon@gmail.com', '965456789', '98765678', '2025-09-09', NULL, 1000000000.00, 1, NULL, '1234567890', '', '', '', 'active', '2025-09-15 22:01:34', '2025-09-15 22:01:34'),
(61, 'KAMAL', 'PLA008', 'Search', 'O-', 'kamal@gmail.com', 'kamalplatoon@gmail.com', '90909090', '987689980', '2026-09-09', '2000-04-06', 15000.00, 1, NULL, '1234567876', 'HDFC00001243', 'FYKPM1234Q', '123456789012', 'active', '2025-09-16 16:14:28', '2025-09-16 16:14:28'),
(62, 'Sathya Prakash B', 'PLA0001', NULL, 'A+ve', 'armysathya.25@gmail.com', 'sathyaprakash@platoontitleservices.com', '7845044010', '8608399488', '2023-03-07', '1994-01-25', 50000.00, 1, NULL, '154801504321 ', '', 'FVBPS8439C', '952175473788 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(63, 'Saravanan R', 'PLA0002', NULL, 'B+ve', 'saravanarajan4@gmail.com', 'saravana@platoontitleservices.com', '8248316541', '8438485551', '2023-09-12', '1994-04-07', 0.00, 1, NULL, '10035168903 ', '', 'GDSPS6199P', '808563389954 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(64, 'Deepak Paul Prassana J', 'PLA0003', NULL, 'O+ve', 'deepak.prassana@gmail.com', 'paul@platoontitleservices.com', '9894194594', '9494866415', '2022-07-13', '1988-02-27', 0.00, 1, NULL, '730701500199 ', '', 'BPVPD2414L', '717511519476 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(65, 'Sunil S', 'PLA0004', NULL, 'A+ve', 'sunil.john1214@gmail.com', 'John.Tyler@platoontitleservices.com', '8056566997', '7708708918', '2022-07-13', '1990-07-12', 0.00, 1, NULL, '058701514773', '', 'DKVPS4593G', '723445970983 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(66, 'Sathish R', 'PLA0005', NULL, 'B+ve', 'rsathishmail1@gmail.com', 'Steve.R@platoontitleservices.com', '9597057997', '9597009467', '2022-07-13', '1991-04-12', 0.00, 1, NULL, '036001539192', '', 'FWAPS6079A', '488295994554 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(67, 'Deepa V', 'PLA0014', NULL, '', 'deepavid1998@gmail.com', 'deepa.v@platoontitleservices.com', '9042012644', '9344946554', '2024-05-20', '1998-03-01', 0.00, 1, NULL, '218901509747 ', '', 'GWLPD3081H', '304319357307 ', 'inactive', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(68, 'Nandhini K', 'PLA0015', NULL, '', 'nandhu531999@gmail.com', 'Nandhini.K@platoontitleservices.com', '6380876783', '', '2024-06-03', '1999-03-05', 0.00, 1, NULL, '433201501785 ', '', 'BFIPN0344G', '513169222029 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(69, 'Dinesh B', 'PLA0020', NULL, '', 'dhineshraina212@gmail.com', 'Dinesh.B@platoontitleservices.com', '9994373255', '9865546766', '2024-07-03', '1999-06-02', 0.00, 1, NULL, '50100610855859 ', 'HDFC0001281', 'DYXPD0459N', '866346527483 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(70, 'Aravind K', 'PLA0023', NULL, 'B+ve', 'aravindkathir21@gmail.com', 'Aravind.Kathirvel@platoontitleservices.com', '8838417098', '8220596700', '2024-07-22', '1997-03-14', 0.00, 1, NULL, '034201529116', 'ICIC0000342', 'HECPK7488M', '958232040584 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(71, 'Sakthi K', 'PLA0029', NULL, 'A+ve', 'sakthikcsk@gmail.com', 'sakthi.k@platoontitleservices.com', '9080855040', '9865441796', '2024-09-13', '2000-07-05', 0.00, 1, NULL, '730701500800 ', '', 'NXLPS7437A', '337791896329 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(72, 'Rahul  S', 'PLA0030', NULL, 'B+ve', 'rahulsubramani222@gmail.com', 'rahul.s@platoontitleservices.com', '9597993868', '9842924988', '2024-09-16', '1997-11-26', 0.00, 1, NULL, '50100562957922 ', 'HDFC0001068', 'CAJPR8912F', '527533985072 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(73, 'Karan', 'PLA0036', NULL, 'B+ve', 'karansubramani222@gmail.com', 'karan.s@platoontitleservices.com', '9597846274', '8825902270', '2025-01-20', '2001-03-04', 0.00, 1, NULL, '062391900001566', 'YESB0000623', 'HILPK0586B', '554665880152 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(74, 'Thangapandiyan G', 'PLA0038', NULL, '', 'thangapandiyan.gunasekaran@gmail.com', 'thangapandiyan.g@platoontitleservices.com', '9524862501', '9514351824', '2025-02-24', '1999-01-06', 0.00, 1, NULL, '12870100154501 ', 'FDRL0001287', 'CUOPG7478N', '495446295653 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(75, 'Hemapriya P', 'PLA0039', NULL, '', 'Hemapriyapanner18@gmail.com', 'Hemapriya.P@platoontitleservices.com', '7373905036', '8220000973', '2025-03-01', '1995-10-18', 0.00, 1, NULL, '433201501786 ', 'ICIC0004332', 'AIZPH2843R', '945838889905 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(76, 'Dinesh Mark J', 'PLA0043', NULL, 'B+ve', 'dinesh.mark93@gmail.com', 'Dinesh.Mark@platoontitleservices.com', '9790704095', '9894937441', '2025-04-01', '1993-10-20', 0.00, 1, NULL, '7901000068813 ', 'IOBA0000079', 'BZPPJ3179J', '524675822534 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(77, 'Jeeva N', 'PLA0044', NULL, 'O+ve', 'jeevamaxwell1@gmail.com', 'Jeeva.n@platoontitleservices.com', '9944824320', '9944198679', '2025-05-23', '2001-02-20', 0.00, 1, NULL, '159944824320 ', '', 'CSBPN2921G', '279726870257 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(78, 'Hariharan K', 'PLA0045', NULL, 'O-ve', 'harih117@gmail.com', 'Hariharan.K@platoontitleservices.com', '9003714131', '9443033251', '2025-07-25', '1992-12-13', 0.00, 1, NULL, '32984549689 ', 'SBIN0016384', 'AQFPH5118K', '239686597231 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(79, 'Prabhakaran G', 'PLA0046', NULL, 'B+ve', 'martinprabhakaran2060@gmail.com', 'Prabhakaran.G@platoontitleservices.com', '6379068842', '8489887916', '2025-07-29', '2000-06-20', 0.00, 1, NULL, '184401000014242 ', 'IOBA0001844', 'GAEPP7580L', '344194904438 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(80, 'Sreenath S', 'PLA0048', NULL, 'B+ve', 'javagilseenath6@gmail.com', '', '8807401103', '8489244713', '2025-08-06', '2001-03-15', 0.00, 1, NULL, '10149085051 ', 'IDFB0080128', 'OHDPS9065K', '254678147519 ', 'active', '2025-09-16 17:40:36', '2025-09-16 17:40:36'),
(82, 'mani K', 'pla0011', '', '', '', '', '', '', '2028-09-09', NULL, 0.00, 1, NULL, '', '', '', '', 'active', '2025-09-16 20:50:50', '2025-09-16 20:50:50'),
(83, 'nijam m', 'pkaaa', '', '', '', '', '', '', '2028-09-09', NULL, 0.00, 1, NULL, '', '', '', '', 'active', '2025-09-16 20:52:40', '2025-09-16 20:52:40'),
(84, 'margan', 'PLA0090', 'IT', 'A+', 'Margan@gmail.com', 'Marganplatoon@gmail.com', '2345678765', '2345676543', '2025-09-09', '2000-09-09', 10000.00, 1, '0001-01-01', '1234567890', 'HDFC001234', 'Fykp9013A', '123456789012', 'active', '2025-09-16 20:56:18', '2025-09-16 20:56:18'),
(86, 'nijam m', 'pkaaal', '', '', '', '', '', '', '2028-09-09', NULL, 0.00, 1, NULL, '', '', '', '', 'active', '2025-09-16 20:58:15', '2025-09-16 20:58:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `empId` (`empId`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_empId` (`empId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
