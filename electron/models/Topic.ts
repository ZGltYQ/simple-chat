import Base from "./Base";
import { topicsTable } from "../db/schemas";

export default class Topic extends Base {
    static schema = topicsTable;
}