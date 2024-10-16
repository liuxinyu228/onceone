-- MySQL dump 10.13  Distrib 8.0.29, for Win64 (x86_64)
--
-- Host: localhost    Database: supervisor
-- ------------------------------------------------------
-- Server version	8.0.29

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
-- Table structure for table `card_system`
--

DROP TABLE IF EXISTS `card_system`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_system` (
  `system_id` int NOT NULL AUTO_INCREMENT,
  `task_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `system_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_classification` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `superintendent_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '绯荤粺璐熻矗浜哄鍚?,
  `superintendent_phone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `superintendent_email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `end_at` datetime DEFAULT NULL,
  PRIMARY KEY (`system_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card_system`
--

LOCK TABLES `card_system` WRITE;
/*!40000 ALTER TABLE `card_system` DISABLE KEYS */;
INSERT INTO `card_system` VALUES (14,'d4d89f27-ecd2-4bbc-bb1b-e59fe96e68a5','www','101','w','131','w@email.com','2024-10-06 00:00:00','2024-10-06 18:27:42',NULL),(16,'077bf171-4713-4480-ac2e-8b5b57b6f87d','QQQ','101','q','123','1234@test.com','2024-10-06 00:00:00','2024-10-11 18:54:53','2024-10-11 00:00:00'),(17,'557ac9d8-a5dd-4105-802b-73e26650da06','ABC','101','ABC','1234','123@test.com','2024-10-09 00:00:00','2024-10-09 18:59:02',NULL),(19,'c74387f1-f112-4587-90f9-cbb12f58a96e','wwcc','101','wwcc','123','w@email.com','2024-10-11 15:36:14','2024-10-11 15:36:14','2024-10-11 00:00:00'),(20,'16b77daa-75f4-48e6-94a0-8180ca8be26b','wwcc','101','wwcc','123','w@email.com','2024-10-11 00:00:00','2024-10-11 15:41:02',NULL),(21,'8c6eabac-f490-4092-8238-f3364397c371','wqq','101','wqq','1234','w@email.com','2024-10-11 15:50:45','2024-10-11 15:50:45','2024-10-11 00:00:00'),(23,'55a6e258-c001-43a6-97e9-bdc40597ca4e','ouu','101','ouu','1234','o@email.com','2024-10-11 16:45:39','2024-10-11 16:45:39','2024-10-11 00:00:00'),(24,'f228983f-ca0e-4fd2-9e0b-e83fd2b7d0b4','qmk','101','qmk','1234','123@test.com','2024-10-11 18:56:10','2024-10-11 18:56:10','2024-10-11 00:00:00'),(25,'a1e47d4b-56ba-422f-a84c-c5e058decc15','qsc','101','qsc','1234','q@emai.com','2024-10-12 09:43:03','2024-10-12 09:43:03','2024-10-12 00:00:00'),(26,'64e4a255-9902-4229-b346-39b867650530','qwer','101','qwer','123','123@test.com','2024-10-12 00:00:00','2024-10-12 11:50:47',NULL),(27,'45c7269c-cff7-4437-958d-fb2faf58a5a5','kkk','101','kkk','123','123@test.com','2024-10-12 00:00:00','2024-10-12 11:54:58',NULL);
/*!40000 ALTER TABLE `card_system` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `card_task`
--

DROP TABLE IF EXISTS `card_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_task` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_classification` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '璇勪及浠诲姟绫诲瀷锛屽鍙屾柊璇勪及銆佹秹璇堣瘎浼?,
  `description` text COLLATE utf8mb4_unicode_ci,
  `guide` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reportContent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `materialPath` json DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `taskCategory` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '缁嗗垎浠诲姟绫诲瀷锛氬椋庨櫓椤广€佷繚闅滈」',
  `task_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `riskValue` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `template_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card_task`
--

LOCK TABLES `card_task` WRITE;
/*!40000 ALTER TABLE `card_task` DISABLE KEYS */;
INSERT INTO `card_task` VALUES (25,'宸插畬鎴?,'瀛︿範璁″垝','101','姣忔棩瀛︿範浠诲姟瀹夋帓','璇︾粏鐨勪换鍔℃寚寮?,'',NULL,NULL,'2024-10-06 18:27:42','2024-10-06 18:27:54','淇濋殰椤?,'d4d89f27-ecd2-4bbc-bb1b-e59fe96e68a5','low',NULL),(26,'杩涜涓?,'鐢ㄦ埛鏁伴噺','101','妫€鏌ョ敤鎴锋暟閲?,'鐢ㄦ埛鏁伴噺鏄惁瓒呰繃涓€涓?,'',NULL,NULL,'2024-10-06 18:27:42','2024-10-06 18:27:49','椋庨櫓椤?,'d4d89f27-ecd2-4bbc-bb1b-e59fe96e68a5','low',NULL),(29,'杩涜涓?,'瀛︿範璁″垝','101','姣忔棩瀛︿範浠诲姟瀹夋帓','璇︾粏鐨勪换鍔℃寚寮?,NULL,'[{\"id\": \"2f755a3a-ad90-4723-9baf-97f931356c90\", \"path\": \"uploads\\\\works\\\\QQQ\\\\101\\\\瀛︿範璁″垝\\\\a.png\"}]',NULL,'2024-10-06 18:45:21','2024-10-09 17:37:17','淇濋殰椤?,'077bf171-4713-4480-ac2e-8b5b57b6f87d',NULL,NULL),(30,'杩涜涓?,'鐢ㄦ埛鏁伴噺','101','妫€鏌ョ敤鎴锋暟閲?,'鐢ㄦ埛鏁伴噺鏄惁瓒呰繃涓€涓?,NULL,'[]',NULL,'2024-10-06 18:45:21','2024-10-09 17:08:18','椋庨櫓椤?,'077bf171-4713-4480-ac2e-8b5b57b6f87d',NULL,NULL),(31,'杩涜涓?,'aaa','101','aaaaaaaaaaaaaaaabbbbbbbcccccccddddddddddddddddddddddeeeeeeeeeeeeeeeeeee','','',NULL,NULL,'2024-10-09 16:05:15','2024-10-09 18:55:29','鍗忓姪椤?,'077bf171-4713-4480-ac2e-8b5b57b6f87d','low',NULL),(32,'寰呭紑濮?,'aaa','101','aaa','',NULL,NULL,NULL,'2024-10-09 16:06:10','2024-10-09 16:06:10','鍗忓姪椤?,'077bf171-4713-4480-ac2e-8b5b57b6f87d',NULL,NULL),(33,'杩涜涓?,'瀛︿範璁″垝','101','姣忔棩瀛︿範浠诲姟瀹夋帓','璇︾粏鐨勪换鍔℃寚寮?,NULL,NULL,NULL,'2024-10-09 18:59:02','2024-10-09 18:59:02','淇濋殰椤?,'557ac9d8-a5dd-4105-802b-73e26650da06',NULL,NULL),(34,'杩涜涓?,'鐢ㄦ埛鏁伴噺','101','妫€鏌ョ敤鎴锋暟閲?,'鐢ㄦ埛鏁伴噺鏄惁瓒呰繃涓€涓?,NULL,NULL,NULL,'2024-10-09 18:59:02','2024-10-09 18:59:02','椋庨櫓椤?,'557ac9d8-a5dd-4105-802b-73e26650da06',NULL,NULL),(37,'杩涜涓?,'瀛︿範璁″垝','101','姣忔棩瀛︿範浠诲姟瀹夋帓','璇︾粏鐨勪换鍔℃寚寮?,NULL,NULL,NULL,'2024-10-11 15:36:15','2024-10-11 15:36:15','淇濋殰椤?,'c74387f1-f112-4587-90f9-cbb12f58a96e',NULL,NULL),(38,'杩涜涓?,'鐢ㄦ埛鏁伴噺','101','妫€鏌ョ敤鎴锋暟閲?,'鐢ㄦ埛鏁伴噺鏄惁瓒呰繃涓€涓?,NULL,NULL,NULL,'2024-10-11 15:36:15','2024-10-11 15:36:15','椋庨櫓椤?,'c74387f1-f112-4587-90f9-cbb12f58a96e',NULL,NULL),(39,'杩涜涓?,'瀛︿範璁″垝','101','姣忔棩瀛︿範浠诲姟瀹夋帓','璇︾粏鐨勪换鍔℃寚寮?,NULL,NULL,NULL,'2024-10-11 15:41:03','2024-10-11 15:41:03','淇濋殰椤?,'16b77daa-75f4-48e6-94a0-8180ca8be26b',NULL,NULL),(40,'杩涜涓?,'鐢ㄦ埛鏁伴噺','101','妫€鏌ョ敤鎴锋暟閲?,'鐢ㄦ埛鏁伴噺鏄惁瓒呰繃涓€涓?,NULL,NULL,NULL,'2024-10-11 15:41:03','2024-10-11 15:41:03','椋庨櫓椤?,'16b77daa-75f4-48e6-94a0-8180ca8be26b',NULL,NULL),(41,'杩涜涓?,'瀛︿範璁″垝','101','姣忔棩瀛︿範浠诲姟瀹夋帓','璇︾粏鐨勪换鍔℃寚寮?,NULL,NULL,NULL,'2024-10-11 15:50:46','2024-10-11 15:50:46','淇濋殰椤?,'8c6eabac-f490-4092-8238-f3364397c371',NULL,NULL),(42,'杩涜涓?,'鐢ㄦ埛鏁伴噺','101','妫€鏌ョ敤鎴锋暟閲?,'鐢ㄦ埛鏁伴噺鏄惁瓒呰繃涓€涓?,NULL,NULL,NULL,'2024-10-11 15:50:46','2024-10-11 15:50:46','椋庨櫓椤?,'8c6eabac-f490-4092-8238-f3364397c371',NULL,NULL),(45,'杩涜涓?,'瀛︿範璁″垝','101','姣忔棩瀛︿範浠诲姟瀹夋帓','璇︾粏鐨勪换鍔℃寚寮?,NULL,NULL,NULL,'2024-10-11 16:45:39','2024-10-11 16:45:39','淇濋殰椤?,'55a6e258-c001-43a6-97e9-bdc40597ca4e',NULL,NULL),(46,'杩涜涓?,'鐢ㄦ埛鏁伴噺','101','妫€鏌ョ敤鎴锋暟閲?,'鐢ㄦ埛鏁伴噺鏄惁瓒呰繃涓€涓?,NULL,NULL,NULL,'2024-10-11 16:45:39','2024-10-11 16:45:39','椋庨櫓椤?,'55a6e258-c001-43a6-97e9-bdc40597ca4e',NULL,NULL),(47,'杩涜涓?,'瀛︿範璁″垝','101','姣忔棩瀛︿範浠诲姟瀹夋帓','璇︾粏鐨勪换鍔℃寚寮?,NULL,NULL,NULL,'2024-10-11 18:56:10','2024-10-11 18:56:10','淇濋殰椤?,'f228983f-ca0e-4fd2-9e0b-e83fd2b7d0b4',NULL,NULL),(48,'杩涜涓?,'鐢ㄦ埛鏁伴噺','101','妫€鏌ョ敤鎴锋暟閲?,'鐢ㄦ埛鏁伴噺鏄惁瓒呰繃涓€涓?,NULL,NULL,NULL,'2024-10-11 18:56:10','2024-10-11 18:56:10','椋庨櫓椤?,'f228983f-ca0e-4fd2-9e0b-e83fd2b7d0b4',NULL,NULL),(49,'杩涜涓?,'瀛︿範璁″垝','101','姣忔棩瀛︿範浠诲姟瀹夋帓','璇︾粏鐨勪换鍔℃寚寮?,NULL,NULL,NULL,'2024-10-12 09:43:04','2024-10-12 09:43:04','淇濋殰椤?,'a1e47d4b-56ba-422f-a84c-c5e058decc15',NULL,NULL),(50,'杩涜涓?,'鐢ㄦ埛鏁伴噺','101','妫€鏌ョ敤鎴锋暟閲?,'鐢ㄦ埛鏁伴噺鏄惁瓒呰繃涓€涓?,NULL,NULL,NULL,'2024-10-12 09:43:04','2024-10-12 09:43:04','椋庨櫓椤?,'a1e47d4b-56ba-422f-a84c-c5e058decc15',NULL,NULL),(51,'杩涜涓?,'瀛︿範璁″垝','101','姣忔棩瀛︿範浠诲姟瀹夋帓','璇︾粏鐨勪换鍔℃寚寮?,NULL,NULL,NULL,'2024-10-12 11:50:47','2024-10-12 11:50:47','淇濋殰椤?,'64e4a255-9902-4229-b346-39b867650530',NULL,1),(52,'杩涜涓?,'鐢ㄦ埛鏁伴噺','101','妫€鏌ョ敤鎴锋暟閲?,'鐢ㄦ埛鏁伴噺鏄惁瓒呰繃涓€涓?,NULL,NULL,NULL,'2024-10-12 11:50:47','2024-10-12 11:50:47','椋庨櫓椤?,'64e4a255-9902-4229-b346-39b867650530',NULL,7),(53,'杩涜涓?,'qwe','101','qwe','qwe',NULL,NULL,NULL,'2024-10-12 11:50:47','2024-10-12 11:50:47','淇濋殰椤?,'64e4a255-9902-4229-b346-39b867650530',NULL,13),(54,'杩涜涓?,'ccc','101','ccc','ccc',NULL,NULL,NULL,'2024-10-12 11:50:47','2024-10-12 11:50:47','淇濋殰椤?,'64e4a255-9902-4229-b346-39b867650530',NULL,15),(55,'杩涜涓?,'瀛︿範璁″垝','101','姣忔棩瀛︿範浠诲姟瀹夋帓','璇︾粏鐨勪换鍔℃寚寮?,NULL,NULL,NULL,'2024-10-12 11:54:58','2024-10-12 11:54:58','淇濋殰椤?,'45c7269c-cff7-4437-958d-fb2faf58a5a5',NULL,1),(56,'杩涜涓?,'鐢ㄦ埛鏁伴噺','101','妫€鏌ョ敤鎴锋暟閲?,'鐢ㄦ埛鏁伴噺鏄惁瓒呰繃涓€涓?,NULL,NULL,NULL,'2024-10-12 11:54:58','2024-10-12 11:54:58','椋庨櫓椤?,'45c7269c-cff7-4437-958d-fb2faf58a5a5',NULL,7),(57,'杩涜涓?,'qwe','101','qwe','qwe',NULL,NULL,NULL,'2024-10-12 11:54:58','2024-10-12 11:54:58','淇濋殰椤?,'45c7269c-cff7-4437-958d-fb2faf58a5a5',NULL,13),(58,'杩涜涓?,'ccc','101','ccc','ccc',NULL,NULL,NULL,'2024-10-12 11:54:58','2024-10-12 11:54:58','淇濋殰椤?,'45c7269c-cff7-4437-958d-fb2faf58a5a5',NULL,15),(70,'杩涜涓?,'TEST146yyy','101','TEST146yyy','杩欐槸娴嬭瘯','',NULL,NULL,'2024-10-13 15:30:22','2024-10-13 15:31:01','椋庨櫓椤?,'d4d89f27-ecd2-4bbc-bb1b-e59fe96e68a5','low',32),(71,'杩涜涓?,'TEST146yyy','101','TEST146yyy','杩欐槸娴嬭瘯',NULL,NULL,NULL,'2024-10-13 15:30:22','2024-10-13 15:31:01','椋庨櫓椤?,'077bf171-4713-4480-ac2e-8b5b57b6f87d',NULL,32),(72,'杩涜涓?,'TEST146yyy','101','TEST146yyy','杩欐槸娴嬭瘯',NULL,NULL,NULL,'2024-10-13 15:30:22','2024-10-13 15:31:01','椋庨櫓椤?,'557ac9d8-a5dd-4105-802b-73e26650da06',NULL,32),(73,'杩涜涓?,'TEST146yyy','101','TEST146yyy','杩欐槸娴嬭瘯',NULL,NULL,NULL,'2024-10-13 15:30:22','2024-10-13 15:31:01','椋庨櫓椤?,'c74387f1-f112-4587-90f9-cbb12f58a96e',NULL,32),(74,'杩涜涓?,'TEST146yyy','101','TEST146yyy','杩欐槸娴嬭瘯',NULL,NULL,NULL,'2024-10-13 15:30:22','2024-10-13 15:31:01','椋庨櫓椤?,'16b77daa-75f4-48e6-94a0-8180ca8be26b',NULL,32),(75,'杩涜涓?,'TEST146yyy','101','TEST146yyy','杩欐槸娴嬭瘯',NULL,NULL,NULL,'2024-10-13 15:30:22','2024-10-13 15:31:01','椋庨櫓椤?,'8c6eabac-f490-4092-8238-f3364397c371',NULL,32),(76,'杩涜涓?,'TEST146yyy','101','TEST146yyy','杩欐槸娴嬭瘯',NULL,NULL,NULL,'2024-10-13 15:30:22','2024-10-13 15:31:01','椋庨櫓椤?,'55a6e258-c001-43a6-97e9-bdc40597ca4e',NULL,32),(77,'杩涜涓?,'TEST146yyy','101','TEST146yyy','杩欐槸娴嬭瘯',NULL,NULL,NULL,'2024-10-13 15:30:22','2024-10-13 15:31:01','椋庨櫓椤?,'f228983f-ca0e-4fd2-9e0b-e83fd2b7d0b4',NULL,32),(78,'杩涜涓?,'TEST146yyy','101','TEST146yyy','杩欐槸娴嬭瘯',NULL,NULL,NULL,'2024-10-13 15:30:22','2024-10-13 15:31:01','椋庨櫓椤?,'a1e47d4b-56ba-422f-a84c-c5e058decc15',NULL,32),(79,'杩涜涓?,'TEST146yyy','101','TEST146yyy','杩欐槸娴嬭瘯',NULL,NULL,NULL,'2024-10-13 15:30:22','2024-10-13 15:31:01','椋庨櫓椤?,'64e4a255-9902-4229-b346-39b867650530',NULL,32),(80,'杩涜涓?,'TEST146yyy','101','TEST146yyy','杩欐槸娴嬭瘯',NULL,NULL,NULL,'2024-10-13 15:30:22','2024-10-13 15:31:01','椋庨櫓椤?,'45c7269c-cff7-4437-958d-fb2faf58a5a5',NULL,32);
/*!40000 ALTER TABLE `card_task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `card_task_template`
--

DROP TABLE IF EXISTS `card_task_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_task_template` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `work_classification` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '璇勪及浠诲姟绫诲瀷锛屽鍙屾柊璇勪及銆佹秹璇堣瘎浼?,
  `description` text COLLATE utf8mb4_unicode_ci,
  `guide` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `taskCategory` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '缁嗗垎浠诲姟绫诲瀷锛氬椋庨櫓椤广€佷繚闅滈」',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card_task_template`
--

LOCK TABLES `card_task_template` WRITE;
/*!40000 ALTER TABLE `card_task_template` DISABLE KEYS */;
INSERT INTO `card_task_template` VALUES (1,'瀛︿範璁″垝','101','姣忔棩瀛︿範浠诲姟瀹夋帓','璇︾粏鐨勪换鍔℃寚寮?,'2024-09-22 19:05:43','2024-10-12 11:03:42','淇濋殰椤?),(16,'asd','101','asd','asd','2024-10-13 13:54:48','2024-10-13 13:54:48','淇濋殰椤?),(17,'asd','101','asdasdasdasdasdasdasdasdasdqweqweqweqwrwqerqeqwrqwerqwe','asd','2024-10-13 13:55:10','2024-10-13 14:02:11','淇濋殰椤?),(18,'klkl22','101','杩欐槸娴嬭瘯娴嬭瘯','杩欐槸娴嬭瘯娴嬭瘯','2024-10-13 14:39:11','2024-10-13 14:42:08','淇濋殰椤?),(21,'杩欐槸娴嬭瘯aaa','101','杩欐槸娴嬭瘯','杩欐槸娴嬭瘯','2024-10-13 14:42:21','2024-10-13 14:45:08','椋庨櫓椤?),(22,'杩欐槸娴嬭瘯22','101','杩欐槸娴嬭瘯22','杩欐槸娴嬭瘯22','2024-10-13 14:42:26','2024-10-13 14:42:26','椋庨櫓椤?),(23,'杩欐槸娴嬭瘯','101','杩欐槸娴嬭瘯','杩欐槸娴嬭瘯','2024-10-13 14:42:31','2024-10-13 14:45:04','椋庨櫓椤?),(24,'杩欐槸娴嬭瘯44','101','杩欐槸娴嬭瘯44','4','2024-10-13 14:43:31','2024-10-13 14:45:17','椋庨櫓椤?),(28,'asd22','101','asd','asd','2024-10-13 14:46:16','2024-10-13 14:46:16','淇濋殰椤?),(29,'asd66','101','asd66','asd66','2024-10-13 14:46:45','2024-10-13 14:46:45','椋庨櫓椤?),(30,'asd99','102','asd99','asd99','2024-10-13 14:47:25','2024-10-13 14:47:25','椋庨櫓椤?),(32,'TEST146yyy','101','TEST146yyy','杩欐槸娴嬭瘯','2024-10-13 15:30:22','2024-10-13 15:31:01','椋庨櫓椤?);
/*!40000 ALTER TABLE `card_task_template` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `card_timeline`
--

DROP TABLE IF EXISTS `card_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_timeline` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `attachment_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card_timeline`
--

LOCK TABLES `card_timeline` WRITE;
/*!40000 ALTER TABLE `card_timeline` DISABLE KEYS */;
INSERT INTO `card_timeline` VALUES (13,'QWE','2024-10-09','QWE','..\\..\\uploads\\timeline\\2024-10-09\\QWE\\a.png'),(14,'qwe2','2024-10-09','qwe','..\\..\\uploads\\timeline\\2024-10-09\\qwe2\\a.png');
/*!40000 ALTER TABLE `card_timeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `card_user_persona`
--

DROP TABLE IF EXISTS `card_user_persona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_user_persona` (
  `persona_id` int DEFAULT NULL,
  `persona_value` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card_user_persona`
--

LOCK TABLES `card_user_persona` WRITE;
/*!40000 ALTER TABLE `card_user_persona` DISABLE KEYS */;
INSERT INTO `card_user_persona` VALUES (606,'璇勪及宸ヤ綔浜哄憳'),(707,'涓氬姟缁忕悊');
/*!40000 ALTER TABLE `card_user_persona` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `card_users`
--

DROP TABLE IF EXISTS `card_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint DEFAULT NULL,
  `businessSystemListID` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_admin` int DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `group_id` int DEFAULT NULL,
  `persona_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card_users`
--

LOCK TABLES `card_users` WRITE;
/*!40000 ALTER TABLE `card_users` DISABLE KEYS */;
INSERT INTO `card_users` VALUES (26,'liuxinyu','Liuliu228@',0,'fc850864-5de5-4ad2-a32c-d319df0d8820','2024-10-11 19:09:01','2024-10-12 10:37:44',1,'l@email.com','18488806803',111,606),(27,'test','^JDjo@DB',1,NULL,'2024-10-12 09:17:17','2024-10-12 09:18:42',0,'t@mail.com','13111111111',132,606),(28,'test4','$sN17C4g',1,NULL,'2024-10-13 14:31:44','2024-10-13 14:38:06',0,'t@mail.com','13111111111',121,606),(29,'test3','P2tY(n@$',1,NULL,'2024-10-13 14:36:22','2024-10-13 14:38:44',0,'t@mail.com','13111111111',121,606),(30,'aaa','7QJl0Vy7',0,NULL,'2024-10-13 14:36:28','2024-10-13 14:38:38',0,'t@mail.com','13111111111',121,707),(31,'test5','^aoT*6&#',0,NULL,'2024-10-13 14:38:24','2024-10-13 14:38:24',0,'t@mail.com','13111111111',131,606);
/*!40000 ALTER TABLE `card_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `directories`
--

DROP TABLE IF EXISTS `directories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `directories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isOpen` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `directories`
--

LOCK TABLES `directories` WRITE;
/*!40000 ALTER TABLE `directories` DISABLE KEYS */;
INSERT INTO `directories` VALUES (10,'AAA',0),(11,'BBB',0);
/*!40000 ALTER TABLE `directories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `directory_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `directory_id` (`directory_id`),
  CONSTRAINT `files_ibfk_1` FOREIGN KEY (`directory_id`) REFERENCES `directories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
INSERT INTO `files` VALUES (18,'a.png','..\\..\\uploads\\filemanager\\AAA\\a.png',10);
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_businesssystem_map`
--

DROP TABLE IF EXISTS `user_businesssystem_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_businesssystem_map` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_businessSystem_list_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `businessSystem_id` int DEFAULT NULL,
  `group_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_businesssystem_map`
--

LOCK TABLES `user_businesssystem_map` WRITE;
/*!40000 ALTER TABLE `user_businesssystem_map` DISABLE KEYS */;
INSERT INTO `user_businesssystem_map` VALUES (10,'fc850864-5de5-4ad2-a32c-d319df0d8820',14,111),(12,'b1922be6-d2f6-44d7-960b-8eca3f1e6825',16,111),(15,'fc850864-5de5-4ad2-a32c-d319df0d8820',19,111),(16,'fc850864-5de5-4ad2-a32c-d319df0d8820',20,111),(17,'fc850864-5de5-4ad2-a32c-d319df0d8820',21,111),(19,'b1922be6-d2f6-44d7-960b-8eca3f1e6825',23,111),(20,'fc850864-5de5-4ad2-a32c-d319df0d8820',24,111),(21,'fc850864-5de5-4ad2-a32c-d319df0d8820',25,111),(22,'fc850864-5de5-4ad2-a32c-d319df0d8820',26,111),(23,'fc850864-5de5-4ad2-a32c-d319df0d8820',27,111);
/*!40000 ALTER TABLE `user_businesssystem_map` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workclassificationkey`
--

DROP TABLE IF EXISTS `workclassificationkey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workclassificationkey` (
  `id` int NOT NULL,
  `workclassificationNumber` int DEFAULT NULL,
  `workClassificationName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workclassificationkey`
--

LOCK TABLES `workclassificationkey` WRITE;
/*!40000 ALTER TABLE `workclassificationkey` DISABLE KEYS */;
INSERT INTO `workclassificationkey` VALUES (1,101,'鏂版妧鏈柊涓氬姟瀹夊叏璇勪及'),(2,102,'娑夎瘓椋庨櫓瀹夊叏璇勪及');
/*!40000 ALTER TABLE `workclassificationkey` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-10-13 17:27:39
