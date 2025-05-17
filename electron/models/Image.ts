import Base from "./Base";
import { imagesTable, messagesRelations } from "../db/schemas";

export default class Image extends Base {
  static schema = imagesTable

  static messages = messagesRelations
}