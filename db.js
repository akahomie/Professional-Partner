const fs = require("fs");

class Collection {
	constructor(db, name) {
		this.db = db;
		this.Name = name;
		this.Data = {};
	}

	Set(id, val) {
		this.Data[id] = val;
	}

	FindByValue(prop, val) {
		for (let key of Object.keys(this.Data)) {
			if (this.Data[key][prop] == val) {
				return { key: key, value: this.Data[key] };
			}
		}

		return { value: null };
	}

	FindAll(prop) {
		let arr = [];

		for (let key of Object.keys(this.Data)) {
			if (this.Data[key][prop])
				arr.push({ key: key, value: this.Data[key][prop] });
		}

		return arr;
	}

	Get(id) {
		this.db.Refresh();

		return this.Data[id];
	}

	Take(count) {
		let array = [];
		let keys = Object.keys(this.Data);

		for (let i = 0; i < count; i++) {
			if (i > keys.length) break;

			array.push(this.Data[keys[i]]);
		}

		return array;
	}

	Delete(id) {
		delete this.Data[id];
	}

	Save() {
		this.db.Data[this.Name] = this.Data;

		this.db.Flush();
	}

	toString() {
		return JSON.stringify(this.Data);
	}
}

class DB {
	constructor(file) {
		this.File = file;

		fs.readFile(file, (err, data) => {
			this.Data = JSON.parse(data);
		});

		// Loaded collections
		this.Collections = [];
	}

	Refresh() {
		return new Promise((res, rej) => {
			fs.readFile(this.File, (err, data) => {
				this.Data = JSON.parse(data);

				for (let col of this.Collections) {
					col.Data = this.Data[col.Name] || {};
				}

				res();
			});
		});
	}

	Flush() {
		fs.writeFile('db.json', JSON.stringify(this.Data), (err) => {

		});
	}

	Has(name) {
		return this.Collections.findIndex(c => c.Name == name) != -1;
	}

	Get(name) {
		if (! this.Has(name))
			throw new Error(`Collection ${name} not in DB`);
		
		return this.Collections[this.Collections.findIndex(c => c.Name == name)];
	}

	Create(name) {
		let col = new Collection(this, name);

		this.Collections.push(col);

		return col;
	}
}

module.exports = DB;