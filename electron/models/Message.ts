import Base from "./Base";
import { messagesTable, imagesRelations } from "../db/schemas";

export default class Message extends Base {
    static schema = messagesTable;

    static images = imagesRelations;
}