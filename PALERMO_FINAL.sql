CREATE DATABASE  IF NOT EXISTS `inve_fact_palermo` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `inve_fact_palermo`;
-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: inve_fact_palermo
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `cedula_o_nit` varchar(45) NOT NULL,
  `telefono` int NOT NULL,
  `direccion` varchar(150) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `tipo_cliente` enum('contado','credito') NOT NULL DEFAULT 'contado',
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_factura`
--

DROP TABLE IF EXISTS `detalle_factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_factura` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `cantidad` decimal(10,0) NOT NULL,
  `precio_kg_ud` decimal(10,0) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS ((`cantidad` * `precio_kg_ud`)) VIRTUAL,
  `id_factura` int NOT NULL,
  `id_producto` int NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `fk_detalle_factura_factura1_idx` (`id_factura`),
  KEY `fk_detalle_factura_producto1_idx` (`id_producto`),
  CONSTRAINT `fk_detalle_factura_factura1` FOREIGN KEY (`id_factura`) REFERENCES `facturas` (`id_factura`),
  CONSTRAINT `fk_detalle_factura_producto1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_factura`
--

LOCK TABLES `detalle_factura` WRITE;
/*!40000 ALTER TABLE `detalle_factura` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturas`
--

DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturas` (
  `id_factura` int NOT NULL AUTO_INCREMENT,
  `numero_factura` int NOT NULL,
  `tipo_factura` enum('POS','CREDITO') NOT NULL DEFAULT 'POS',
  `id_cliente` int NOT NULL,
  `fecha_emision` date NOT NULL,
  `total_factura` decimal(10,0) NOT NULL,
  `estado` enum('PAGADA','PENDIENTE') NOT NULL DEFAULT 'PENDIENTE',
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_factura`),
  KEY `fk_factura_usuario_idx` (`id_usuario`),
  KEY `fk_factura_cliente1_idx` (`id_cliente`),
  CONSTRAINT `fk_factura_cliente1` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`),
  CONSTRAINT `fk_factura_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturas`
--

LOCK TABLES `facturas` WRITE;
/*!40000 ALTER TABLE `facturas` DISABLE KEYS */;
/*!40000 ALTER TABLE `facturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos_inventario`
--

DROP TABLE IF EXISTS `movimientos_inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimientos_inventario` (
  `id_movimiento` int NOT NULL AUTO_INCREMENT,
  `tipo_movimiento` enum('entrada','salida','ajustes','mermas','perdidas','devolucion') NOT NULL,
  `cantidad` decimal(10,0) NOT NULL,
  `fecha_movimiento` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_producto` int NOT NULL,
  `id_usuario` int NOT NULL,
  `observaciones` varchar(250) DEFAULT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `fk_inventario_usuario1_idx` (`id_usuario`),
  KEY `fk_inventario_producto1_idx` (`id_producto`),
  CONSTRAINT `fk_inventario_producto1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`),
  CONSTRAINT `fk_inventario_usuario1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos_inventario`
--

LOCK TABLES `movimientos_inventario` WRITE;
/*!40000 ALTER TABLE `movimientos_inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimientos_inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pago`
--

DROP TABLE IF EXISTS `pago`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pago` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `fecha_pago` date NOT NULL,
  `monto_pagado` decimal(10,0) NOT NULL,
  `metodo_pago` enum('efectivo','electronico','mixto') NOT NULL DEFAULT 'efectivo',
  `saldo_pendiente` decimal(10,0) NOT NULL DEFAULT '0',
  `id_factura` int DEFAULT NULL,
  PRIMARY KEY (`id_pago`),
  KEY `fk_pago_factura1_idx` (`id_factura`),
  CONSTRAINT `fk_pago_factura1` FOREIGN KEY (`id_factura`) REFERENCES `facturas` (`id_factura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pago`
--

LOCK TABLES `pago` WRITE;
/*!40000 ALTER TABLE `pago` DISABLE KEYS */;
/*!40000 ALTER TABLE `pago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `codigo` int NOT NULL,
  `nombre_producto` varchar(150) NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `unidad_medida` enum('KG','UND') NOT NULL DEFAULT 'KG',
  `stock` decimal(10,0) NOT NULL DEFAULT '0',
  `precio_venta` decimal(10,0) NOT NULL,
  `precio_compra` decimal(10,0) NOT NULL,
  `estado` enum('disponible','agotado') NOT NULL DEFAULT 'disponible',
  PRIMARY KEY (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(45) NOT NULL,
  `correo` varchar(250) NOT NULL,
  `rol` enum('admin','cajero','contadora') NOT NULL DEFAULT 'cajero',
  `usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  `telefono` int NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-12 11:44:24
