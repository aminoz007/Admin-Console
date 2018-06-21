var Account = require('../models/account-model');

module.exports = {

    create: function (req, res) {

        // Validate request
        if(Object.keys(req.body).length === 0) {
            return res.status(400).send({
                message: "Account body cannot be empty"
            });
        }

        // Save Accounts in the database
        Account.create(req.body, function(err, data) {
            if(err) return res.status(500).send({
                message: "Some error occurred while creating the accounts",
                error: err.message,
                'successful accounts': data,
            });
            res.send(data);
        });
    },

    getAll: function (req, res) {
        
        Account.find(req.query)
        .then(accounts => {
            res.send(accounts);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving accounts."
            });
        });
    },

    update: function (req, res) {

        // Validate Request
        if(Object.keys(req.body).length === 0) {
            return res.status(400).send({
                message: "Account body can not be empty"
            });
        }

        // check if someone changed the account 
        Account.findById(req.params.accountId)
        .then(account => { 
            if(account) {
                if(Date.parse(account.last_changed_at) > Date.parse(req.body.last_changed_at)) {
                    return res.status(500).send({
                        message: "A newer version exist for account id " + req.params.accountId
                    });
                } else {
                    // update the last_changed_at with current time
                    req.body.last_changed_at = Date.now();
                    // Find account and update it with the request body
                    Account.findByIdAndUpdate(req.params.accountId, req.body, {new: true, runValidators: true})
                    .then(account => {
                        res.send(account);
                    }).catch(err => {
                        return res.status(500).send({
                            message: "Error updating account with id " + req.params.accountId,
                            error: err.message
                        });
                    });
                }
            }
            else {
                return res.status(404).send({
                    message: "Account not found with id " + req.params.accountId
                });  
            }
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Account not found with id " + req.params.accountId
                });                
            }
            return res.status(500).send({
                message: "Error retrieving account with id " + req.params.accountId
            });
        });

    },

    get: function (req, res) {
        
        Account.findById(req.params.accountId)
        .then(account => {
            if(!account) {
                return res.status(404).send({
                    message: "Account not found with id " + req.params.accountId
                });            
            }
            res.send(account);
        }).catch(err => {
            if(err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Account not found with id " + req.params.accountId
                });                
            }
            return res.status(500).send({
                message: "Error retrieving Account with id " + req.params.accountId
            });
        });
    },

    delete: function (req, res) {

        Account.findByIdAndRemove(req.params.accountId)
        .then(account => {
            if(!account) {
                return res.status(404).send({
                    message: "Account not found with id " + req.params.accountId
                });
            }
            res.send({message: "Account deleted successfully!"});
        }).catch(err => {
            if(err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "Account not found with id " + req.params.accountId
                });                
            }
            return res.status(500).send({
                message: "Could not delete Account with id " + req.params.accountId
            });
        });

    },

    stats: function (req, res) {

        const aggregatorOpts1 = [
            {
                $project:
                  {
                    env: "$environment",
                    package:
                      {
                        $concat: [ "$basic_package", 
                                    {$cond: ["$bolton_hbo" , " + HBO", "" ]},
                                    {$cond: ["$bolton_cinemax" , " + Cinemax", "" ]},
                                    {$cond: ["$bolton_starz" , " + Starz", "" ]},
                                    {$cond: ["$bolton_showtime" , " + Showtime", "" ]}
                                 ]
                      }
                  }
             },
            {
                $group: {
                    _id: {env: "$env",  package: "$package"},
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.env",
                    acct_pkgs: {
                        $push:{
                            pkg: "$_id.package",
                            count: "$count"
                        }
                    },
                    count: { $sum: "$count" }
                }
            },
            {$sort: {_id: 1}}
        ];
        const aggregatorOpts2 = [
            {
                $group: {
                    _id: {env: "$environment",  types: "$account_type"},
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.env",
                    acct_types: {
                        $push:{
                            type: "$_id.types",
                            count: "$count"
                        }
                    },
                    count: { $sum: "$count" }
                }
            },
            {$sort: {_id: 1}}     
        ];

        const aggregatorOpts3 = [
            {
                $group: {
                    _id: {env: "$environment",  delivery: "$delivery"},
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.env",
                    status: {
                        $push:{
                            type: "$_id.delivery",
                            count: "$count"
                        }
                    },
                    count: { $sum: "$count" }
                }
            },
            {$sort: {_id: 1}}     
        ];
        
        const stats1 = Account.aggregate(aggregatorOpts1).exec();
        const stats2 = Account.aggregate(aggregatorOpts2).exec();
        const stats3 = Account.aggregate(aggregatorOpts3).exec();
        Promise.all([stats1, stats2, stats3]).then(stats =>
            res.send(
                stats[2].map((stat, index) => 
                        Object.assign(stat,{ "acct_pkgs": stats[0][index]["acct_pkgs"], "acct_types": stats[1][index]["acct_types"] }))
                    )
        );
    }

};