-- sudo mysql -u rachelker -p < schema.sql

USE rachelker;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    pw BINARY(60) NOT NULL,
    session_token VARCHAR(50),
    magic VARCHAR(50)
);

CREATE TABLE channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(50) NOT NULL UNIQUE,
    creator_id INT NOT NULL,
    last_read JSON,
    FOREIGN KEY(creator_id) REFERENCES users(id)
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel_id INT NOT NULL,
    author_id INT NOT NULL,
    body TEXT,
    replies_to INT,
    creation_time DATETIME,
    FOREIGN KEY(channel_id) REFERENCES channels(id) ON DELETE CASCADE,
    FOREIGN KEY(author_id) REFERENCES users(id),
    FOREIGN KEY(replies_to) REFERENCES messages(id) ON DELETE CASCADE
);

