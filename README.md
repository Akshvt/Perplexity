Data Modelling- Creating visual, structure blueprints of info of how ata is stored in DB

Features:
-Authentication system 
  >Email verifiction
-Chat with AI
-Chat History
-Message Storage
-AI with Internet research feature


User Data:
_id
username
email 
password
verified [ No (default) / Yes ] --email link verification
createdAt
updatedAt

Chat Model:
-id
user
title
createdAt
updatedAt

Message:
_id
chat
content
role : [user, ai]