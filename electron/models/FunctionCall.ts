import Base from "./Base";
import { functionsTable } from "../db/schemas";

export default class FunctionCall extends Base {
  static schema = functionsTable
}