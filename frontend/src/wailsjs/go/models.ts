export namespace app {
	
	export class Service {
	    Name: string;
	    DisplayName: string;
	    Status: string;
	    Type: string;
	
	    static createFrom(source: any = {}) {
	        return new Service(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.DisplayName = source["DisplayName"];
	        this.Status = source["Status"];
	        this.Type = source["Type"];
	    }
	}

}

