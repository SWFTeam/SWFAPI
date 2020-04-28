CREATE DATABASE IF NOT EXISTS SWF;
USE SWF;

DROP TABLE IF EXISTS preference_challenge;
DROP TABLE IF EXISTS preference_advice;
DROP TABLE IF EXISTS preference_survey;
DROP TABLE IF EXISTS event;
DROP TABLE IF EXISTS challenge;
DROP TABLE IF EXISTS advice;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS address;
DROP TABLE IF EXISTS survey;

CREATE TABLE IF NOT EXISTS address(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    country VARCHAR(100),
    city VARCHAR(255),
    street VARCHAR(255),
    zip_code INT(5),
    nb_house INT,
    complement VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS survey(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
);

CREATE TABLE IF NOT EXISTS need(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name VARCHAR(25),
    description VARCHAR(100)
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
    work_address INT NULL,
    FOREIGN KEY (address_id) REFERENCES address(id),
    FOREIGN KEY (survey_id) REFERENCES survey(id),
    FOREIGN KEY (work_address) REFERENCES address(id)
);

CREATE TABLE IF NOT EXISTS event(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    description VARCHAR(255),
    address_id INT NOT NULL,
    date_start DATE,
    date_end DATE,
    exp_earning DOUBLE,
    FOREIGN KEY (address_id) REFERENCES address(id)
);

CREATE TABLE IF NOT EXISTS challenge(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    description VARCHAR(255),
    exp_earning DOUBLE
);

CREATE TABLE IF NOT EXISTS advice(
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    description VARCHAR(255),
);

CREATE TABLE IF NOT EXISTS achieve(
    user_id INT NOT NULL,
    chal_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (chal_id) REFERENCES challenge(id),
    PRIMARY KEY (user_id, chal_id)
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
    needs_id INT NOT NULL,
    FOREIGN KEY (survey_id) REFERENCES survey(id),
    FOREIGN KEY (needs_id) REFERENCES needs(id),
    PRIMARY KEY(survey_id, needs_id)
);

CREATE TABLE IF NOT EXISTS preference_challenge (
    challenge_id INT NOT NULL,
    needs_id INT NOT NULL,
    FOREIGN KEY (challenge_id) REFERENCES challenge(id),
    FOREIGN KEY (needs_id) REFERENCES needs(id),
    PRIMARY KEY(survey_id, needs_id)
);

CREATE TABLE IF NOT EXISTS preference_advice (
    advice_id INT NOT NULL,
    needs_id INT NOT NULL,
    FOREIGN KEY (advice_id) REFERENCES advice(id),
    FOREIGN KEY (needs_id) REFERENCES needs(id),
    PRIMARY KEY(survey_id, needs_id)
);

