
  const express = require('express');
  const stateRoute = express.Router();

  let State = require ('./state.model');
// const { estimatedDocumentCount } = require('./productcatg.model');

   // FUNCTION TO SAVE STATE

    stateRoute.route('/save').post ((req,res)=>{
        let state = new State(req.body);
        state.save().then(state =>{
            res.send("STATE SAVED");
            res.end();
        }).catch(err =>{
            res.send(err);
            res.end();
        });
    });

    // SEARCH STATE
      stateRoute.route('/search/:stid').get((req,res)=>{
        State.findOne({"stid":req.params.stid}).then(state => {
            res.send(state);
            res.end();
        }).catch(err =>{
            res.send(err);
            res.end();
        });
      });


         // UPDATE STATE

         stateRoute.route('/update').put((req,res)=>{
             State.updateOne({"stid":req.body.stid},{"stid":req.body.stid,"stname":req.body.stname,"status":req.body.status}).then(state =>{
                res.send("STATE UPDATED SUCESSFULLY");
                res.end();
             }).catch(err =>{
                 res.send(err);
                 res.end();
             });
         });

           
         //  DELETE ENABLE OR DISBALE

                    const handleDeleteButton = () => {
            if (stid != undefined && stid != "") {
                axios
                .delete("https://server-app-xite.onrender.com/state/delete/" + stid)
                .then((res) => {
                    alert(res.data);
                })
                .catch((err) => {
                    alert(err);
                });
            } else {
                alert("FILL STATE ID TO DELETE");
            }
            };


           // SHOW ALL USED TO GET ALL DATA FORM MONGODB

             stateRoute.route('/show').get(function (req,res)
            {
                State.find({"status":1}).then(state => {
                    res.send(state);
                    res.end();
                }).catch(err =>{
                    res.send(err);
                    res.end();
                })
            })


               // SHOW ALL

               stateRoute.route('/getall').get(function (req,res) {
                 State.find().then(state => {
                    res.send(state);
                    res.end();
                 }).catch(err =>{
                    res.send(err);
                    res.end();
                 });
               });


               // SEARCH STATE BY NAME TO AVOID DUPLICATE ENTRY

                stateRoute.route('/searchbyname/:stname').get((req,res)=>{
                     State.findOne({"stname":req.params.stname}).then(state => {
                             res.send(state);
                             res.end();
                     }).catch(err => {
                        res.send(err);
                        res.end();
                     })
                });
                module.exports = stateRoute;

