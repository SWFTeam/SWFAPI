## TEST DATA ##
USE SWF

SET FOREIGN_KEY_CHECKS = 0; 
#TRUNCATE info;
TRUNCATE participate;
TRUNCATE preference_challenge;
TRUNCATE preference_advice;
TRUNCATE preference_survey;
TRUNCATE description;
TRUNCATE event;
TRUNCATE achieve;
TRUNCATE need;
TRUNCATE challenge;
TRUNCATE experience;
TRUNCATE advice;
TRUNCATE user;
TRUNCATE address;
TRUNCATE survey;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO need (id) VALUES (null); #1
INSERT INTO need (id) VALUES (null); #2
INSERT INTO need (id) VALUES (null); #3
INSERT INTO need (id) VALUES (null); #4
INSERT INTO need (id) VALUES (null); #5
INSERT INTO survey (id) VALUES (null); #1
#INSERT INTO preference_survey (survey_id, need_id) VALUES (1, 1);
#INSERT INTO description (country_code, title, description, need_id) 
#    VALUES ("FR", "NOM NEED", "Je suis un test de description de l'entité hasBike", 1);
INSERT INTO description (country_code, title, description, type, foreign_id) 
    VALUES("GB", "hasCar", "Je suis une nouvelle version de la table pour tester", "need", 2);
INSERT INTO description (country_code, title, description, type, foreign_id) 
    VALUES("GB", "hasBike", "Je suis une nouvelle version de la table pour tester", "need", 3);
INSERT INTO description (country_code, title, description, type, foreign_id) 
    VALUES("FR", "recycleTrash", "Je suis une nouvelle version de la table pour tester", "need", 4);
INSERT INTO description (country_code, title, description, type, foreign_id) 
    VALUES("FR", "publicTransports", "Je suis une nouvelle version de la table pour tester", "need", 5);
INSERT INTO description (country_code, title, description, type, foreign_id) 
    VALUES("FR", "aVelo", "Je suis une nouvelle version de la table pour tester", "need", 3);

