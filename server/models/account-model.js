var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountShema = new mongoose.Schema({

    account_id: {type: Number, required: true},
    environment: {type: String, rquired: true, enum: ['production', 'staging', 'simulator']},
    access_id: {type: String, required: true},
    password: {type: String, required:true},
    guid: Number,
    profile_id: String,
    partner_profile_id: String,
    account_token: String,
    account_type: String,
    basic_package: {type: String, required:true, enum: ['GOTTA HAVE IT', 'GO BIG', 'LIVE A LITTLE', 'JUST RIGHT']},
    bolton_hbo: {type: Boolean, default: false},
    bolton_cinemax: {type: Boolean, default: false},
    bolton_starz: {type: Boolean, default: false},
    bolton_showtime: {type: Boolean, default: false},
    zip_code: {type: Number, max: 99999},
    city: String,
    delivery: {type: String, default: 'Ready for distribution', enum: ['Ready for distribution', 'Delivered', 'Updating zip code', 'Do not deliver']},
    scrum_team: String,
    requester: String,
    comment: String,
    last_changed_at: {type: Date, default: Date.now()},
    last_changed_by: {type: Schema.Types.ObjectId, ref: 'User'},
    id: false

},
{
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

accountShema.virtual('package')
            .get( function (){
                const boltons = [];
                if (this.bolton_hbo) boltons.push('HBO');
                if (this.bolton_cinemax) boltons.push('Cinemax');
                if (this.bolton_starz) boltons.push('Starz');
                if (this.bolton_showtime) boltons.push('Showtime');
                return this.basic_package + ' + ' + boltons.join(' + ');
            });

// account id + env are unique
accountShema.index({ account_id: 1, environment: 1}, { unique: true });

module.exports = mongoose.model('Account', accountShema);