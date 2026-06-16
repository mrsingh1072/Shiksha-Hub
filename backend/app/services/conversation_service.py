from datetime import datetime

from bson import ObjectId

from app.database.mongodb import db


def _serialize_conversation(item):
    if not item:
        return None
    item["_id"] = str(item["_id"])
    return item


async def list_conversations(user_email: str, conversation_type: str | None = None):
    conversations = []
    query = {"user_email": user_email}

    if conversation_type == "tutor":
        query["$or"] = [
            {"conversation_type": "tutor"},
            {"conversation_type": {"$exists": False}},
        ]
    elif conversation_type:
        query["conversation_type"] = conversation_type

    cursor = db.tutor_conversations.find(query).sort("updated_at", -1)

    async for item in cursor:
        conversations.append(_serialize_conversation(item))

    return conversations


async def get_conversation(user_email: str, conversation_id: str):
    conversation = await db.tutor_conversations.find_one({
        "_id": ObjectId(conversation_id),
        "user_email": user_email,
    })
    return _serialize_conversation(conversation)


async def create_conversation(
    user_email: str,
    title: str = "New conversation",
    conversation_type: str = "tutor",
):
    now = datetime.utcnow()
    document = {
        "user_email": user_email,
        "title": title,
        "conversation_type": conversation_type,
        "messages": [],
        "created_at": now,
        "updated_at": now,
    }
    result = await db.tutor_conversations.insert_one(document)
    document["_id"] = str(result.inserted_id)
    return document


async def append_message(
    user_email: str,
    conversation_id: str,
    role: str,
    content: str,
    documentation: str | None = None,
):
    message = {
        "role": role,
        "content": content,
        "created_at": datetime.utcnow(),
    }

    if documentation:
        message["documentation"] = documentation

    conversation = await get_conversation(user_email, conversation_id)
    if not conversation:
        return None

    update_fields = {"updated_at": datetime.utcnow()}
    if role == "user" and not conversation.get("messages"):
        update_fields["title"] = content[:80]

    await db.tutor_conversations.update_one(
        {
            "_id": ObjectId(conversation_id),
            "user_email": user_email,
        },
        {
            "$push": {"messages": message},
            "$set": update_fields,
        },
    )

    return message


async def rename_conversation(user_email: str, conversation_id: str, title: str):
    result = await db.tutor_conversations.update_one(
        {
            "_id": ObjectId(conversation_id),
            "user_email": user_email,
        },
        {
            "$set": {
                "title": title,
                "updated_at": datetime.utcnow(),
            }
        },
    )
    return result.modified_count > 0


async def delete_conversation(user_email: str, conversation_id: str):
    result = await db.tutor_conversations.delete_one({
        "_id": ObjectId(conversation_id),
        "user_email": user_email,
    })
    return result.deleted_count > 0


async def count_conversations(user_email: str, conversation_type: str | None = None):
    query = {"user_email": user_email}
    if conversation_type:
        query["conversation_type"] = conversation_type
    return await db.tutor_conversations.count_documents(query)
