export class Account {

    account_id: number;
    environment: string;
    access_id: string;
    password: string;
    guid: number;
    profile_id: string;
    partner_profile_id: string;
    account_token: string;
    account_type: string;
    basic_package: string;
    bolton_hbo: boolean;
    bolton_cinemax: boolean;
    bolton_starz: boolean;
    bolton_showtime: boolean;
    zip_code: number;
    city: string;
    delivery: string;
    scrum_team: string;
    requester: string;
    comment: string;
    last_changed_at?: Date;
    last_changed_by: string;
    _id: string;
    change_type?: string;

    static isValid(object: Account): void {

        // check if we have all keys for each row
        if (Object.keys(object).sort().join() !== this.getVisibleColumns().map(col => col.name).sort().join()) {
            throw new Error('Number of row\'s columns different than the header');
        }

        // build an array containg all what we need to validate for each field
        const listOfValidation = this.getVisibleColumns().map(col => {
                                        const obj = {name: '', value: '', required: false, isNumber: false, isBoolean: false};
                                        if (col['required'] !== undefined) { obj.required = col['required'] ; }
                                        if (col.type === 'number') { obj.isNumber = true; }
                                        if (col.type === 'boolean') { obj.isBoolean = true; }
                                        obj.name = col.name;
                                        obj.value = object[col.name];
                                        return obj;
                                    });

        // Validate each field
        listOfValidation.forEach(field => {
            const castedValue = this.fieldIsValid(field.name, field.value, field.required, field.isNumber, field.isBoolean);
            object[field.name] = castedValue;
        });
    }


    static fieldIsValid(name: string, value: string, required: boolean, isNumber: boolean, isBoolean: boolean): any {

        if (required && !value.trim()) {
            throw new Error(`Field ${name} is required`);
        }
        // check if it is a number if yes then transform the string to number
        if (isNumber) {
            if (isNaN(+value)) {
                throw new Error(`Field '${name}' should be a number not '${value}'`);
            } else {
                return +value;
            }
        }
        // check if it is a boolean if yes then transform the string to boolean
        if (isBoolean) {
            if (!(value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
                throw new Error(`Field '${name}' should be a boolean not '${value}'`);
            } else {
                return value.toLowerCase() === 'true';
            }
        }

        if (name === 'account_type' && !Account.getAcctTypes().includes(value)) {
            throw new Error(`Field '${name}' should be one of these values ${Account.getAcctTypes()}`);
        }

        if (name === 'basic_package' && !Account.getBasicPackages().includes(value)) {
            throw new Error(`Field '${name}' should be one of these values ${Account.getBasicPackages()}`);
        }

        if (name === 'delivery' && !Account.getDeliveryStatus().includes(value)) {
            throw new Error(`Field '${name}' should be one of these values ${Account.getDeliveryStatus()}`);
        }

        if (name === 'environment' && !Account.getEnv().includes(value)) {
            throw new Error(`Field '${name}' should be one of these values ${Account.getEnv()}`);
        }
        return value;
    }

    static getAcctTypes() {
        return ['DTVN', 'DTVE', 'DTVN + DTVE', 'Uverse', 'DTVN + Uverse', 'DTVE + Uverse', 'DTVN + DTVE + Uverse',
            'Wireless', 'DTVN + Wireless', 'DTVE + Wireless', 'DTVN + DTVE + Wireless', 'Uverse + Wireless',
            'DTVN + Uverse + Wireless', 'DTVE + Uverse + Wireless', 'DTVN + DTVE + Uverse + Wireless'];
    }

    static getBasicPackages() {
        return ['GOTTA HAVE IT', 'GO BIG', 'LIVE A LITTLE', 'JUST RIGHT'];
    }

    static getDeliveryStatus() {
        return ['Ready for distribution', 'Delivered', 'Updating zip code', 'Do not deliver'];
    }

    static getEnv() {
        return ['production', 'staging', 'simulator'];
    }

    static getVisibleColumns() {
        return [
            { name: 'account_id', label: 'Account Id', editable: false, required: true, type: 'number'},
            { name: 'environment', label: 'Environment', editable: false, required: true, enum:  this.getEnv(), type: 'string'},
            { name: 'access_id', label: 'Access Id', editable: true, required: true, type: 'string' },
            { name: 'password', label: 'Password', editable: true, required: true, type: 'string' },
            { name: 'guid', label: 'Guid', editable: true, type: 'number' },
            { name: 'profile_id', label: 'Profile Id', editable: true, type: 'string' },
            { name: 'partner_profile_id', label: 'Partner profile Id', editable: true, type: 'string' },
            { name: 'account_token', label: 'Account token', editable: true, type: 'string' },
            { name: 'account_type', label: 'Account type', editable: true, enum: this.getAcctTypes(), type: 'string' },
            { name: 'basic_package', label: 'Basic package', editable: true, enum: this.getBasicPackages(), type: 'string' },
            { name: 'bolton_hbo', label: 'HBO', editable: true, enum: [true, false], type: 'boolean' },
            { name: 'bolton_cinemax', label: 'Cinemax', editable: true, enum: [true, false], type: 'boolean' },
            { name: 'bolton_starz', label: 'STARZ', editable: true, enum: [true, false], type: 'boolean' },
            { name: 'bolton_showtime', label: 'Showtime', editable: true, enum: [true, false], type: 'boolean' },
            { name: 'zip_code', label: 'Zip code', editable: true, type: 'number' },
            { name: 'city', label: 'City', editable: true, type: 'string' },
            { name: 'delivery', label: 'Delivery status', editable: true, enum: this.getDeliveryStatus(), type: 'string' },
            { name: 'scrum_team', label: 'Scrum team', editable: true, type: 'string' },
            { name: 'requester', label: 'Requester', editable: true, type: 'string' },
            { name: 'comment', label: 'Comment', editable: true, type: 'string' },
            { name: 'last_changed_at', label: 'Last changed at', editable: false, type: 'Date' },
            { name: 'last_changed_by', label: 'Last changed by', editable: false , type: 'string'}
            ];
    }
}
