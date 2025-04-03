-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: authentication_database
-- ------------------------------------------------------
-- Server version	8.0.41-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_name` varchar(255) DEFAULT NULL,
  `classes` varchar(50) NOT NULL,
  `nmb_students` int DEFAULT '0',
  `monday` time DEFAULT NULL,
  `monday_end` time DEFAULT NULL,
  `tuesday` time DEFAULT NULL,
  `tuesday_end` time DEFAULT NULL,
  `wednesday` time DEFAULT NULL,
  `wednesday_end` time DEFAULT NULL,
  `thursday` time DEFAULT NULL,
  `thursday_end` time DEFAULT NULL,
  `friday` time DEFAULT NULL,
  `friday_end` time DEFAULT NULL,
  `saturday` time DEFAULT NULL,
  `saturday_end` time DEFAULT NULL,
  `sunday` time DEFAULT NULL,
  `sunday_end` time DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'zuhjlds','20',1,NULL,NULL,'10:02:00','11:02:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'groupa','5',2,'10:34:00','11:34:00',NULL,NULL,NULL,NULL,'15:34:00','04:34:00',NULL,NULL,NULL,NULL,NULL,NULL),(3,NULL,'20',2,NULL,NULL,'15:59:00','16:59:00','08:59:00','09:59:00',NULL,NULL,'10:59:00','11:59:00',NULL,NULL,'20:59:00','21:00:00'),(4,'hoho','13',2,NULL,NULL,NULL,NULL,'00:05:00','13:05:00',NULL,NULL,'14:05:00','15:06:00',NULL,NULL,NULL,NULL),(5,'hoho','13',2,NULL,NULL,'09:06:00','10:06:00',NULL,NULL,'14:07:00','15:07:00',NULL,NULL,'20:07:00',NULL,NULL,NULL),(6,'yoyo','20',2,'15:30:00','16:30:00',NULL,NULL,NULL,NULL,'21:06:00','22:06:00',NULL,NULL,NULL,NULL,NULL,NULL),(7,'yoyo','20',2,'15:30:00','16:30:00',NULL,NULL,NULL,NULL,'21:06:00','22:06:00',NULL,NULL,NULL,NULL,NULL,NULL),(8,'yoyo','20',2,'15:30:00','16:30:00',NULL,NULL,NULL,NULL,'21:06:00','22:06:00',NULL,NULL,NULL,NULL,NULL,NULL),(9,'yoyo','20',2,'15:30:00','16:30:00',NULL,NULL,NULL,NULL,'21:06:00','22:06:00',NULL,NULL,NULL,NULL,NULL,NULL),(10,'yoyo','20',2,'15:30:00','16:30:00',NULL,NULL,NULL,NULL,'21:06:00','22:06:00',NULL,NULL,NULL,NULL,NULL,NULL),(11,'class22','34',2,'15:30:00','04:30:00',NULL,NULL,NULL,NULL,'17:58:00','18:50:00',NULL,NULL,NULL,NULL,NULL,NULL),(12,'class22','34',2,'15:30:00','04:30:00',NULL,NULL,NULL,NULL,'17:58:00','18:50:00',NULL,NULL,NULL,NULL,NULL,NULL),(13,'kk','67',2,'09:27:00','10:28:00',NULL,NULL,NULL,NULL,NULL,NULL,'15:28:00','16:28:00',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `students_ibfk_1` (`course_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,1,'გიო','giorgadze','giooo22@gmail.com','+101 228 29 28 22'),(2,2,'shefige','xalilova','xalilova2020@gmail.com','+995 597 79 25 44'),(3,2,'Dato','Tanverdovi','tanverdov2002@gmail.com','+108 192 33 44 12'),(4,3,'გიო','მამარდა','giooo22@gmail.com','+187 292 87 99 22'),(5,3,'დათო','დავითაძე','davitaa282@gmail.com','+329 556 84 73 22'),(6,5,'გიო','მამარდა','giooo22@gmail.com','+926 332 49 39 38'),(7,5,'დათო','დავითაძე','davitaa282@gmail.com','+108 192 33 44 12'),(8,6,'კალიკა','bobidy','zazadze84@gmail.com','+987 272 11 22 33'),(9,6,'მომო','ausgfiwailgg','wsdgiwd2@gmail.com','29397372332'),(10,7,'კალიკა','bobidy','zazadze84@gmail.com','+987 272 11 22 33'),(11,7,'მომო','ausgfiwailgg','wsdgiwd2@gmail.com','29397372332'),(12,8,'კალიკა','bobidy','zazadze84@gmail.com','+987 272 11 22 33'),(13,8,'მომო','კაკაძე','wsdgiwd2@gmail.com','29397372332'),(14,9,'კალიკა','bobidy','zazadze84@gmail.com','+987 272 11 22 33'),(15,9,'მომო','კაკაძე','wsdgiwd2@gmail.com','29397372332'),(16,10,'კალიკა','bobidy','zazadze84@gmail.com','+987 272 11 22 33'),(17,10,'მომო','კაკაძე','wsdgiwd2@gmail.com','29397372332'),(18,11,'zaza','bobidy','koko298@gmail.com','+101 228 29 28 22'),(19,11,'დათო','დავითაძე','djashfuhn123@gmail.com','01826218711'),(20,12,'bobo','მამარდა','kakbidze@gmail.com','+926 332 49 39 38'),(21,12,'hsdj','knnocic','djashfuhn123@gmail.com','+108 192 33 44 12'),(22,13,'bobo','jumbadze','giooo22@gmail.com','+111 293 32 23 23'),(23,13,'დათო','კაკაძე','iashdi@gmail.com','01826218711');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test@example.com','myplaintextpassword',NULL),(2,'johndoe@example.com','examplePassword','+995599123456'),(3,'myemail@example.com','s3cur3P@ss123','+995 555 01 99 22'),(4,'newuser@example.com','mypassword','+995 555 01 99 22');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-02 16:54:00
