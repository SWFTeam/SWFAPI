CREATE DATABASE IF NOT EXISTS SWF;
USE SWF;

DROP TABLE IF EXISTS info;
DROP TABLE IF EXISTS preference_challenge;
DROP TABLE IF EXISTS preference_advice;
DROP TABLE IF EXISTS preference_survey;
DROP TABLE IF EXISTS description;
DROP TABLE IF EXISTS participate;
DROP TABLE IF EXISTS achieve;
DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS need;
DROP TABLE IF EXISTS challenge;
DROP TABLE IF EXISTS experience;
DROP TABLE IF EXISTS advice;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS survey;

CREATE TABLE IF NOT EXISTS experience(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    exp DOUBLE
);

CREATE TABLE IF NOT EXISTS survey(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT
);

CREATE TABLE IF NOT EXISTS need(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT
);

CREATE TABLE IF NOT EXISTS advice(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT
);

CREATE TABLE IF NOT EXISTS address(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    country VARCHAR(100),
    city VARCHAR(255),
    street VARCHAR(255),
    zip_code INT(5),
    nb_house INT,
    complement VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS user (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    email_address VARCHAR(200) UNIQUE,
    birthday DATE,
    address_id INT NOT NULL,
    experience DOUBLE,
    survey_id INT NOT NULL,
    address_work INT NULL,
#   info_id INT NULL,
    FOREIGN KEY (address_id) REFERENCES address(id),
    FOREIGN KEY (survey_id) REFERENCES survey(id),
#   FOREIGN KEY (info_id) REFERENCES info(id),
    FOREIGN KEY (address_work) REFERENCES address(id)
);

CREATE TABLE IF NOT EXISTS event(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    address_id INT NOT NULL,
    date_start DATE,
    date_end DATE,
    exp_id INT NOT NULL,
    FOREIGN KEY (address_id) REFERENCES address(id),
    FOREIGN KEY (exp_id) REFERENCES experience(id)
);

CREATE TABLE IF NOT EXISTS challenge(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    exp_id INT NOT NULL,
    FOREIGN KEY (exp_id) REFERENCES experience(id)
);

#CREATE TABLE IF NOT EXISTS info(
#    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
#    electricity DOUBLE NULL,
#    water DOUBLE NULL,
#    ...
#)

CREATE TABLE IF NOT EXISTS achieve(
    user_id INT NOT NULL,
    chall_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (chall_id) REFERENCES challenge(id),
    PRIMARY KEY (user_id, chall_id)
);

CREATE TABLE IF NOT EXISTS participate(
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (event_id) REFERENCES event(id),
    PRIMARY KEY (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS preference_survey (
    survey_id INT NOT NULL,
    need_id INT NOT NULL,
    FOREIGN KEY (survey_id) REFERENCES survey(id),
    FOREIGN KEY (need_id) REFERENCES need(id),
    PRIMARY KEY(survey_id, need_id)
);

CREATE TABLE IF NOT EXISTS preference_challenge (
    chall_id INT NOT NULL,
    need_id INT NOT NULL,
    FOREIGN KEY (chall_id) REFERENCES challenge(id),
    FOREIGN KEY (need_id) REFERENCES need(id),
    PRIMARY KEY (chall_id, need_id)
);

CREATE TABLE IF NOT EXISTS preference_advice (
    advice_id INT NOT NULL,
    need_id INT NOT NULL,
    FOREIGN KEY (advice_id) REFERENCES advice(id),
    FOREIGN KEY (need_id) REFERENCES need(id),
    PRIMARY KEY (advice_id, need_id)
);

CREATE TABLE IF NOT EXISTS description(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    country_code VARCHAR(3),
    title VARCHAR(100),
    description VARCHAR(255),
    need_id INT NULL,
    chall_id INT NULL,
    event_id INT NULL,
    advice_id INT NULL,
    FOREIGN KEY (need_id) REFERENCES need(id),
    FOREIGN KEY (chall_id) REFERENCES challenge(id),
    FOREIGN KEY (event_id) REFERENCES event(id),
    FOREIGN KEY (advice_id) REFERENCES advice(id)
);

## TEST DATA ##
INSERT INTO need (id) VALUES (1);
INSERT INTO description (country_code, title, description, need_id) VALUES ("FR", "NOM NEED", "Je suis un test de description de l'entité hasBike", 1);