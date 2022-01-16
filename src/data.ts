

export class GlobalData {
    private _tables: Record<string,any>;
    set tables(tables:Record<string,any>) {
        this._tables = tables;
    }
    get tables() {
        return this._tables
    }
}