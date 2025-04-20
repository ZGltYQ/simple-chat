import Base from "./Base";
import { settingsTable } from "../db/schemas";

export default class Setting extends Base {
  static schema = settingsTable;

  static async switchSource(source: string) {
    await this.updateAll({ selected: 0 });

    const [target] = await this.findWhere({ source });

    return await this.update({ id: target?.id }, { selected: 1 });
  }
}