-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema diplom
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema diplom
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `diplom` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `diplom` ;

-- -----------------------------------------------------
-- Table `diplom`.`car`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplom`.`car` (
  `idcar` INT NOT NULL AUTO_INCREMENT,
  `mark` VARCHAR(45) NOT NULL,
  `model` VARCHAR(45) NOT NULL,
  `year-from` INT NOT NULL,
  `year-to` INT NOT NULL DEFAULT '0',
  `generation` VARCHAR(45) NOT NULL DEFAULT 'I',
  `petrol-type` VARCHAR(45) NOT NULL DEFAULT 'АИ-95',
  PRIMARY KEY (`idcar`),
  UNIQUE INDEX `idcar_UNIQUE` (`idcar` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 314
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `diplom`.`operating_modes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplom`.`operating_modes` (
  `idoperating_modes` INT NOT NULL AUTO_INCREMENT,
  `mode` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idoperating_modes`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `diplom`.`user`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplom`.`user` (
  `iduser` INT NOT NULL AUTO_INCREMENT,
  `passHash` VARCHAR(512) NOT NULL,
  `login` VARCHAR(100) NOT NULL,
  `authToken` VARCHAR(512) NOT NULL,
  `userPhoto` VARCHAR(100) NOT NULL DEFAULT 'C:\\Users\\maksi\\Documents\\maksi\\Documents\\Study\\Diplom\\diplom_server\\photos\\users\\defUser.png',
  PRIMARY KEY (`iduser`),
  UNIQUE INDEX `iduser_UNIQUE` (`iduser` ASC) VISIBLE,
  UNIQUE INDEX `login_UNIQUE` (`login` ASC) VISIBLE,
  UNIQUE INDEX `authToken_UNIQUE` (`authToken` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 13
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `diplom`.`usercar`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplom`.`usercar` (
  `iduserCar` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `imagePath` VARCHAR(100) NOT NULL DEFAULT 'C:\\Users\\maksi\\Documents\\maksi\\Documents\\Study\\Diplom\\diplom_server\\photos\\cars\\default-car.png',
  `cost` INT NOT NULL,
  `millage` INT NOT NULL,
  `user_iduser` INT NOT NULL,
  `car_idcar` INT NULL DEFAULT NULL,
  `operating_modes_idoperating_modes` INT NOT NULL,
  PRIMARY KEY (`iduserCar`),
  INDEX `fk_userCar_user1_idx` (`user_iduser` ASC) VISIBLE,
  INDEX `fk_userCar_car1_idx` (`car_idcar` ASC) VISIBLE,
  INDEX `fk_usercar_operating_modes1_idx` (`operating_modes_idoperating_modes` ASC) VISIBLE,
  CONSTRAINT `fk_userCar_car1`
    FOREIGN KEY (`car_idcar`)
    REFERENCES `diplom`.`car` (`idcar`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_usercar_operating_modes1`
    FOREIGN KEY (`operating_modes_idoperating_modes`)
    REFERENCES `diplom`.`operating_modes` (`idoperating_modes`),
  CONSTRAINT `fk_userCar_user1`
    FOREIGN KEY (`user_iduser`)
    REFERENCES `diplom`.`user` (`iduser`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 11
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `diplom`.`oil_change`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplom`.`oil_change` (
  `idOil_change` INT NOT NULL AUTO_INCREMENT,
  `date` BIGINT NOT NULL,
  `millage` INT NOT NULL,
  `usercar_iduserCar` INT NOT NULL,
  PRIMARY KEY (`idOil_change`),
  INDEX `fk_Oil_change_usercar1_idx` (`usercar_iduserCar` ASC) VISIBLE,
  CONSTRAINT `fk_Oil_change_usercar1`
    FOREIGN KEY (`usercar_iduserCar`)
    REFERENCES `diplom`.`usercar` (`iduserCar`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `diplom`.`refueling`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplom`.`refueling` (
  `idrefueling` INT NOT NULL AUTO_INCREMENT,
  `date` BIGINT NOT NULL,
  `millage` INT NOT NULL,
  `fuel_quality` INT NOT NULL,
  `petrol-type` VARCHAR(10) NOT NULL,
  `usercar_iduserCar` INT NOT NULL,
  PRIMARY KEY (`idrefueling`),
  INDEX `fk_consumption_usercar1_idx` (`usercar_iduserCar` ASC) VISIBLE,
  CONSTRAINT `fk_consumption_usercar1`
    FOREIGN KEY (`usercar_iduserCar`)
    REFERENCES `diplom`.`usercar` (`iduserCar`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `diplom`.`service`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplom`.`service` (
  `idservice` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NOT NULL,
  `period` INT NOT NULL,
  `car_idcar` INT NOT NULL,
  PRIMARY KEY (`idservice`),
  INDEX `fk_service_car_idx` (`car_idcar` ASC) VISIBLE,
  CONSTRAINT `fk_service_car`
    FOREIGN KEY (`car_idcar`)
    REFERENCES `diplom`.`car` (`idcar`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 44
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `diplom`.`spendingtype`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplom`.`spendingtype` (
  `idspendingType` INT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`idspendingType`),
  UNIQUE INDEX `idspendingType_UNIQUE` (`idspendingType` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 17
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `diplom`.`spending`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `diplom`.`spending` (
  `idSpending` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `description` VARCHAR(45) NULL DEFAULT NULL,
  `isPlanned` TINYINT NULL DEFAULT NULL,
  `date` VARCHAR(20) NULL DEFAULT NULL,
  `millage` INT NULL DEFAULT NULL,
  `userCar_iduserCar` INT NOT NULL,
  `spendingType_idspendingType` INT NOT NULL,
  `cost` INT NOT NULL,
  PRIMARY KEY (`idSpending`),
  INDEX `fk_Spending_userCar1_idx` (`userCar_iduserCar` ASC) VISIBLE,
  INDEX `fk_Spending_spendingType1_idx` (`spendingType_idspendingType` ASC) VISIBLE,
  CONSTRAINT `fk_Spending_spendingType1`
    FOREIGN KEY (`spendingType_idspendingType`)
    REFERENCES `diplom`.`spendingtype` (`idspendingType`),
  CONSTRAINT `fk_Spending_userCar1`
    FOREIGN KEY (`userCar_iduserCar`)
    REFERENCES `diplom`.`usercar` (`iduserCar`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 32
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
