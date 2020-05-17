//as of 4th may use this and not node.js
var bodyParser = require("body-parser");
// express
var nodemailer=require('nodemailer');
var express = require("express");
var session=require('express-session');
var ejs =require('ejs');
var app = express();
var nexmo=require('nexmo');
//var flash=require('connect-flash');
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));

const accountSid=//add account sid here;
const authToken=//add authorisation token here ;

//var flash=require('connect-flash');

var client=require('twilio')(accountSid,authToken);// using a 3rd party api for whatsapp messsages

//app.use(flash());
//app.use(express.static(__dirname + 'videos/'));
//mysql
var mysql = require("mysql");
// connect strings for mysql
var connection = mysql.createConnection({
 host: "localhost",
 user: "root",
 password: //add db password here,
 database: //add db name here
});

// connecting ......
connection.connect();
console.log('connected');
// requesting express to get data as text
// app.use(bodyParser.text());
//app.set('view engine','pug')
app.set('view engine','ejs');
app.get('/',function(req,res,next){
 // console.log(req.body);
  res.sendFile(__dirname + '/home.html');
})
app.get('/signup',function(req,res,next){
 // console.log(req.bod
  res.sendFile(__dirname + '/signup.html');
})
app.post('/submit',function(req,res){
  var pno = req.body.Phone_Number;
 var ano = req.body.Aadhar_Number;
 var email = req.body.Email_Id;
 var bg=req.body.Blood_Group;
 var bid;
 var originalno="+"+91+pno;
 //console.log(originalno);
 switch(bg)
 {
    case 'A+ve':
      bid=1;
      break;
    case 'B+ve':
      bid=2;
      break;
    case 'AB+ve':
      bid=3;
      break;
    case 'O+ve':
      bid=4;
      break;
    case 'A-ve':
      bid=5;
      break;
    case 'B-ve':
      bid=6;
      break;
    case 'AB-ve':
      bid=7;
      break;
    case 'O-ve':
      bid=8;
      break;
}

  
  //console.log(bid);
  connection.query('select * from person where Aadhar_Number="'+ano+'" ', (err, a) => {
    if (err) throw err;
    if (a.length>0){
      //res.render('error',{title:'CREDENTIALS ERROR',message:' USER ALREADY EXISTS'})
    }
});

connection.query('select * from person where Phone_Number="'+pno+'" ', (err, b) => {
  if (err) throw err;
  if (b.length>0){
   // res.render('error',{title:'CREDENTIALS ERROR',message:' USER ALREADY EXISTS'})
  }
});
connection.query('select * from person where Email_Id="'+email+'" ', (err, c) => {
  if (err) throw err;
  if (c.length>0){
    //res.render('error',{title:'CREDENTIALS ERROR',message:' USER ALREADY EXISTS'})
  }
});

var sql ="insert into person values('"+req.body.Patient_Name+"','"+req.body.Phone_Number+"',"+req.body.Aadhar_Number+",'"+req.body.Email_Id+"','"+req.body.City+"','"+req.body.Blood_Group+"','"+bid+"')";
          connection.query(sql,function(err){
           if(err){
             if(err.errno==1062){
              //res.render('haveaccount',{title:'CONGRATULATION',message:' YOU ALREADY HAVE AN ACCOUNT'})
              res.sendFile(__dirname +'/login.html');
             }
             else 
             {
               throw err;
             }
           }
           else{
             var sendtorecieves="insert into receives values("+req.body.Aadhar_Number+",'"+bid+"','"+req.body.Date+"','"+req.body.Latitude+"','"+req.body.Longitude+"')";
             connection.query(sendtorecieves,function(err){
               if(err) throw err;
               connection.query('select distinct (hospital.Name) as Hospital_Name,hospital.Contact_No as Contact_No,availableat.amount as Amount_Of_Blood from hospital,availableat where BID="'+bid+'" and amount>0;',(err,result,fields) =>{
                if(err)throw err;
                var transporter=nodemailer.createTransport({
                  service:'gmail',
                  auth:{
                    user://add company email id,
                    pass://add company email password,
                  }
                });
                var mailOptions={
                  from:// add company email id,
                  to:req.body.Email_Id,
                  subject:'Receive Blood Request Successful',
                  html:"<p>Dear Sir/Maam</p><p >Thank you for contacting <b>Infi Donate</b>.<br><br>We would like to inform you that your request for the blood is received successfully..</p><small>Disclaimer:</small><small>The information in this email and in any files transmitted with it is intended only for the addressee and may contain confidential and/or privileged material.Access to this email by anyone else is unauthorised . If you receive this in error, please contact the sender immediately and delete the material from any computer.If you are not the intended recipient, any disclosure, copying, distribution or any action taken or omitted to be taken in reliance on it, is strictly prohibited.Statement and opinions expressed in this e-mail are those of the sender, and do not necessarily reflect those of Infi Donate .Infi Donate accepts no liability for any damage caused by any virus/worms transmitted by this email. </small>"

                };
                transporter.sendMail(mailOptions,function(err,info){
                  if(err) throw err;
                })


                //console.log("asdas");
                client.messages.create({
                  from:'whatsapp:' //add company whatsapp number,
                  to:'whatsapp:'+originalno,
                  body:'Dear Sir/Maam . Thank you for contacting Infi Donate.We would like to inform you that your request for the blood is received successfully'
                }).then(message=>console.log(message.sid));


                res.render('helpnew',{message:result});

               //res.sendFile(__dirname + '/maps.html');
             })
            })
          
          //res.render('index',{title:'data saved',message:'data saved successfully'})
        }
       });
});
app.get('/login',function(req,res,next){
  res.sendFile(__dirname+'/login.html') 
});
app.post('/profile',function(req,res){
  var pno=req.body.Phone_Number;
  var originalno="+"+91+pno;
  var ano = req.body.Aadhar_Number;
  var bg=req.body.Blood_Group;
  var bid;
  switch(bg)
  {
     case 'A+ve':
       bid=1;
       break;
     case 'B+ve':
       bid=2;
       break;
     case 'AB+ve':
       bid=3;
       break;
     case 'O+ve':
       bid=4;
       break;
     case 'A-ve':
       bid=5;
       break;
     case 'B-ve':
       bid=6;
       break;
     case 'AB-ve':
       bid=7;
       break;
     case 'O-ve':
       bid=8;
       break;
 }
 
  var sendtorecieves="insert into receives values("+req.body.Aadhar_Number+",'"+bid+"','"+req.body.Date+"','"+req.body.Latitude+"','"+req.body.Longitude+"')";
  connection.query(sendtorecieves,function(err){
    if(err){
      if(err.errno==1062)
      {
        //console.log('test');
       // res.render('profile',{title:'profile page',message:'you have successfully made a profile'});
       res.sendFile(__dirname + '/login.html');
      }
      else if(err.errno==1452)
      {
        //console.log('test1');
        res.sendFile(__dirname + '/signup.html');
      }
      else{
        throw err;
      }
    }
    //res.sendFile(__dirname + '/profile.html');
  else{

  connection.query('select * from person where Aadhar_Number="'+ano+'" and BID="'+bid+'"', (err, a) => {
      if (a.length>0){
        //console.log(a[0].Email_Id);
        var originalno="+"+91+a[0].Phone_Number;
       // console.log('test2');
        connection.query('select distinct (hospital.Name) as Hospital_Name,hospital.Contact_No as Contact_No,availableat.amount as Amount_Of_Blood  from hospital,availableat where BID="'+bid+'" and amount>0;',(err,result,fields) =>{
            if(err)throw err;
            //console.log(JSON.stringify(result));
            var transporter=nodemailer.createTransport({
              service:'gmail',
              auth:{
                user://company email id,
                pass://company email id password,
              }
            });
            var mailOptions={
              from://add company email id,
              to:a[0].Email_Id,
              subject:'Receive Blood Request Successful',
              html:"<p>Dear Sir/Maam</p><p >Thank you for contacting <b>Infi Donate</b>.<br><br>We would like to inform you that your request for the blood is received successfully..</p><small>Disclaimer:</small><small>The information in this email and in any files transmitted with it is intended only for the addressee and may contain confidential and/or privileged material.Access to this email by anyone else is unauthorised . If you receive this in error, please contact the sender immediately and delete the material from any computer.If you are not the intended recipient, any disclosure, copying, distribution or any action taken or omitted to be taken in reliance on it, is strictly prohibited.Statement and opinions expressed in this e-mail are those of the sender, and do not necessarily reflect those of Infi Donate .Infi Donate accepts no liability for any damage caused by any virus/worms transmitted by this email. </small>"

            };
            transporter.sendMail(mailOptions,function(err,info){
              if(err) throw err;
            })


            client.messages.create({
              from:'whatsapp:'//add company whatsapp number,
              to:'whatsapp:'+originalno,
              body:'Dear Sir/Maam . Thank you for contacting Infi Donate.We would like to inform you that your request for the blood is received successfully'
            }).then(message=>console.log(message.sid));


            res.render('helpnew',{message:result});
           //res.sendFile(__dirname + '/maps.html');
         })
        
       // res.sendFile(__dirname+'/help.html');
      //res.render('error',{title:'CREDENTIALS ERROR',message:' USER ALREADY EXISTS'})
    }
    else{
      //console.log('reached here');
      res.sendFile(__dirname + '/login.html');
    }
    });
  }
})
  //console.log('executed this also');
  connection.query('delete from receives where BID not in (select BID from person)', (err,check)=>{
    if(err) throw err;
  })

  
})

//WHY GIVE BLOOD!!
app.get('/index',function(req,res,next){
  // console.log(req.body);
   res.sendFile(__dirname + '/Donatenow/index.html');
 })

//DONATE PART!!!

app.get('/give',function(req,res,next){
  // console.log(req.body);
   res.sendFile(__dirname + '/give.html');
 })
 app.post('/donated',function(req,res){
  var pno = req.body.Phone_Number;
  var originalno="+"+91+pno;
  var ano = req.body.Aadhar_Number;
  var email = req.body.Email_Id;
  var bg=req.body.Blood_Group;
  var bid;
  switch(bg)
  {
     case 'A+ve':
       bid=1;
       break;
     case 'B+ve':
       bid=2;
       break;
     case 'AB+ve':
       bid=3;
       break;
     case 'O+ve':
       bid=4;
       break;
     case 'A-ve':
       bid=5;
       break;
     case 'B-ve':
       bid=6;
       break;
     case 'AB-ve':
       bid=7;
       break;
     case 'O-ve':
       bid=8;
       break;
 }
 
  //console.log(bid);
  connection.query('select * from person where Aadhar_Number="'+ano+'" ', (err, a) => {
    if (err) throw err;
    if (a.length>0){
      //res.render('error',{title:'CREDENTIALS ERROR',message:' USER ALREADY EXISTS'})
    }
});

connection.query('select * from person where Phone_Number="'+pno+'" ', (err, b) => {
  if (err) throw err;
  if (b.length>0){
   // res.render('error',{title:'CREDENTIALS ERROR',message:' USER ALREADY EXISTS'})
  }
});
connection.query('select * from person where Email_Id="'+email+'" ', (err, c) => {
  if (err) throw err;
  if (c.length>0){
    //res.render('error',{title:'CREDENTIALS ERROR',message:' USER ALREADY EXISTS'})
  }
});

var sql ="insert into person values('"+req.body.Donor_Name+"','"+req.body.Phone_Number+"',"+req.body.Aadhar_Number+",'"+req.body.Email_Id+"','"+req.body.City+"','"+req.body.Blood_Group+"','"+bid+"')";
          connection.query(sql,function(err){
           if(err){
               if(err.errno==1452)
               {
                var transporter=nodemailer.createTransport({
                  service:'gmail',
                  auth:{
                    user://company email id,
                    pass://company email id password,
                  }
                });
                var mailOptions={
                  from:// add company email id,
                  to:req.body.Email_Id,
                  subject:'Donate Blood Candidate Registered',
                  html:"<p>Dear Sir/Maam</p><p >Thank you for contacting <b>Infi Donate</b>.<br><br>We would like to inform you that your request for donating blood has been processed.</p><small>Disclaimer:</small><small>The information in this email and in any files transmitted with it is intended only for the addressee and may contain confidential and/or privileged material.Access to this email by anyone else is unauthorised . If you receive this in error, please contact the sender immediately and delete the material from any computer.If you are not the intended recipient, any disclosure, copying, distribution or any action taken or omitted to be taken in reliance on it, is strictly prohibited.Statement and opinions expressed in this e-mail are those of the sender, and do not necessarily reflect those of Infi Donate .Infi Donate accepts no liability for any damage caused by any virus/worms transmitted by this email. </small>"

                };
                transporter.sendMail(mailOptions,function(err,info){
                  if(err) throw err;
                })
               // console.log("2");
                client.messages.create({
                  from:'whatsapp:'// add company whatsapp number,
                  to:'whatsapp:'+originalno,
                  body:'Dear Sir/Maam .Thank you for contacting Infi Donate.We would like to inform you that your request for donating blood has been processed.'
                }).then(message=>console.log(message.sid));

                res.sendFile(__dirname+'/home.html')
               }
             else if(err.errno==1062){
              connection.query('select * from donates where Aadhar_Number="'+ano+'" ', (err, a) => {
                if (err) throw err;
                if (a.length>0){
                  var transporter=nodemailer.createTransport({
                    service:'gmail',
                    auth:{
                      user://company email id,
                      pass://company email password,
                    }
                  });
                  var mailOptions={
                    from:// add company email id,
                    to:req.body.Email_Id,
                    subject:'Donate Blood Candidate Registered',
                    // text:`testing123`
                    html:"<p>Dear Sir/Maam</p><p >Thank you for contacting <b>Infi Donate</b>.<br><br>We would like to inform you that your request for donating blood has been processed.</p><small>Disclaimer:</small><small>The information in this email and in any files transmitted with it is intended only for the addressee and may contain confidential and/or privileged material.Access to this email by anyone else is unauthorised . If you receive this in error, please contact the sender immediately and delete the material from any computer.If you are not the intended recipient, any disclosure, copying, distribution or any action taken or omitted to be taken in reliance on it, is strictly prohibited.Statement and opinions expressed in this e-mail are those of the sender, and do not necessarily reflect those of Infi Donate .Infi Donate accepts no liability for any damage caused by any virus/worms transmitted by this email. </small>"
  
                  };
                  transporter.sendMail(mailOptions,function(err,info){
                    if(err) throw err;
                  })
                  //console.log("1")
                  client.messages.create({
                    from:'whatsapp:'// add company whatsapp number,
                    to:'whatsapp:'+originalno,
                    body:'Dear Sir/Maam .Thank you for contacting Infi Donate.We would like to inform you that your request for donating blood has been processed'
                  }).then(message=>console.log(message.sid));


                 res.sendFile(__dirname+'/home.html');
                }
                else{
                  var sendtodonates="insert into donates(Aadhar_Number,BID) values("+req.body.Aadhar_Number+",'"+bid+"')";
             connection.query(sendtodonates,function(err){
               if(err) throw err;
               res.sendFile(__dirname+'/home.html');
             })
        
      //  var checkdonates="insert into donates(Aadhar_Number,BID) values("+req.body.Aadhar_Number+",'"+bid+"')";
      //  connection.query(checkdonates,function(err){
      //   if(err){
      //     if(err.errno==1062){
      //       console.log('duplicate entry , render some suitable webpage')
      //     }
      //   }
      //   else{
      //     console.log("olano");
      //     res.render('donate',{title:'donate page',message:'you are in the donates table'});
      //   }


      //  })

                  
                }
            });
            
             }
            }
           else{
             var sendtodonates="insert into donates(Aadhar_Number,BID) values("+req.body.Aadhar_Number+",'"+bid+"')";
             connection.query(sendtodonates,function(err){
               if(err) throw err;
               var transporter=nodemailer.createTransport({
                service:'gmail',
                auth:{
                  user://add company email id,
                  pass://add company email password,
                }
              });
              var mailOptions={
                from:// add company email id
                to:req.body.Email_Id,
                subject:'Donate Blood Candidate Registered',
                html:"<p>Dear Sir/Maam</p><p >Thank you for contacting <b>Infi Donate</b>.<br><br>We would like to inform you that your request for donating blood has been processed.</p><small>Disclaimer:</small><small>The information in this email and in any files transmitted with it is intended only for the addressee and may contain confidential and/or privileged material.Access to this email by anyone else is unauthorised . If you receive this in error, please contact the sender immediately and delete the material from any computer.If you are not the intended recipient, any disclosure, copying, distribution or any action taken or omitted to be taken in reliance on it, is strictly prohibited.Statement and opinions expressed in this e-mail are those of the sender, and do not necessarily reflect those of Infi Donate .Infi Donate accepts no liability for any damage caused by any virus/worms transmitted by this email. </small>"

              };
              transporter.sendMail(mailOptions,function(err,info){
                if(err) throw err;
              })
              //console.log("3");
              client.messages.create({
                from:'whatsapp:'//add company whatsapp number,
                to:'whatsapp:'+originalno,
                body:'Dear Sir/Maam.Thank you for contacting Infi Donate.We would like to inform you that your request for donating blood has been processed'
              }).then(message=>console.log(message.sid));


              res.sendFile(__dirname+'/home.html');
             })
          
          //res.render('index',{title:'data saved',message:'data saved successfully'})
        }
       });
    //    connection.query('select * from donates where Aadhar_Number="'+ano+'" ', (err, a) => {
    //     if (err) throw err;
    //     if (a.length>0){
    //      res.sendFile(__dirname+'/webpage.html');
    //     }
    //     else{

    //     }
    // });
    

      //  var checkdonates="insert into donates(Aadhar_Number,BID) values("+req.body.Aadhar_Number+",'"+bid+"')";
      //  connection.query(checkdonates,function(err){
      //   if(err){
      //     if(err.errno==1062){
      //       console.log('duplicate entry , render some suitable webpage')
      //     }
      //   }
      //   else{
      //     console.log("ols");
      //     res.render('donate',{title:'donate page',message:'you are in the donates table'});
      //   }


      //  })

 
  //res.render('donate',{title:'donate page',message:'blah blah'});
 })


//  app.get('/help',function(req,res,next){
//   res.sendFile(__dirname+'/help.html') 
// });
app.get('/maps',function(req,res,next){
    // console.log(req.body);
     res.sendFile(__dirname + '/maps.html');
   })


// HOSPITAL PORTAL


var bcrypt = require('bcrypt');
const saltRounds=10;
app.get('/hospital',function(req,res,next){
    // console.log(req.body);
     res.sendFile(__dirname + '/hospital.html');
   })

app.post('/hospitaldata',function(req,res){
    var password =req.body.Password;
    var username=req.body.User_Name;

    bcrypt.hash(password,saltRounds,function(err,hash){
        //console.log(password);
        var hasher='select Password from hospitaldata where User_Name="'+username+'"';
        connection.query(hasher,function(err,olan){
            if(err) throw err;
            if(olan.length>0)
            {
               // console.log(olan[0].Password);
                connection.query('select User_Name from hospitaldata where Password="'+olan[0].Password+'"',function(err,rian){
                    if(err) throw err;
                    if(rian.length>0)
                    {
                        //console.log('login successful');
                        bcrypt.compare(req.body.Password,olan[0].Password,function(err,ress){
                            if(!ress)
                            {
                                //console.log(hash)
                                //console.log('username and passwords dont match');
                                res.sendFile(__dirname+'/hospital.html');
                            }
                            else{
                                connection.query('select Aadhar_Number, Date  from receives',(err,result,fields)=>{
                                    if(err) throw err;
                                    res.render('receivedata',{rcheck:result})
                                })
                                //console.log('login successful');

                            }
                        })
                    }
                    else{
                        //console.log('username and password dont match');
                        res.sendFile(__dirname+'/hospital.html');
                    }

                })
            }
            else{
                //console.log('username and password dont match');
                res.sendFile(__dirname+'/hospital.html');
            }
            
        })
    })
    // connection.query('select * from hospitaldata where User_name="'+username+'"', (err, a) => {
    //     console.log(username);
    //     console.log(password);
    //     console.log(hash);
    //     console.log(a.length)
    //     if (err) throw err;
    //     // if (a.length>0){
    //     //   //res.render('error',{title:'CREDENTIALS ERROR',message:' USER ALREADY EXISTS'})
    //     // }
    //     else{
    //         if(a.length>0)
    //         {
    //             bcrypt.compare('password',hash,function(err,ress){
    //                 if(!ress){
    //                     //console.log(password);
    //                     //console.log(hash);
    //                     console.log('username and passwords dont match');
    //                 }
    //                 else{
    //                     console.log('successful login');
    //                 }
    //             })
    //         }
    //         else{
    //             console.log('username does not exist');
    //         }
    //     }
    // });


    })

//         var sql ="insert into hospitaldata values('"+req.body.User_Name+"','"+hash+"')";
//           connection.query(sql,function(err){
//               if(err)
//               {
//                   if(err.errno==1062)
//                   {
//                     connection.query('select * from hospitaldata where User_Name="'+req.body.User_Name+'" and Password="'+password+'" ', (err, a) => {
//                         if (err) throw err;
//                         else if(bcrypt.compare('password',hash,function(err,ok){
//                             if(ok)
//                             {
//                                 console.log('render an ejs file');
//                             }
//                             else{
//                                 console.log('checkpoint')
//                                 res.sendFile(__dirname+'/hospital.html');
//                             }

//                         }))
//                      {

//                      }

                    
//                         // else{
//                         //     console.log(a.length);
//                         //     res.sendFile(__dirname+'/hospital.html');
//                         // }
//                     });

//                   }
//                   else{
//                       throw err;
//                   }
//               }
//               else{
//                   console.log('delete new entry from hospitaldata');
//               }
//               //res.sendFile(__dirname+'/webpage.html');
//     })

// })
app.post('/final',function(req,res){

    var aadharnumber=req.body.Aadhar_Number;
    var date=req.body.Date;
    //console.log(aadharnumber);
    //console.log(date);
    var done='select * from receives where Aadhar_Number="'+aadharnumber+'" and Date="'+date+'"';
    connection.query(done,function(err,result){
        if(err)throw err;
        if(result.length>0)
        {
            var ok='delete from receives where Aadhar_Number="'+aadharnumber+'" and Date="'+date+'"';
            connection.query(ok,function(err,yipee){
                if(err)throw err;
                else
                {
                    //console.log('this guy received blood')
                    res.sendFile(__dirname +'/hospital.html');
                }

            })
        }
        else{
            //console.log('no patient exists');
            res.sendFile(__dirname +'/hospital.html');
        }
    })
// var count='select count(*) as countlist from receives';
// connection.query(count,function(err,result){
//     if(err) throw error;
//     if(result.length>0)
//     {
//        // console.log(result[0].countlist);
//     }
//     //console.log(req.body.message)
//     console.log(req.body.Aadhar_Number);
//     for(var i=0;i<result[0].countlist;i++)
//     {
//         if(req.body.checknow)
//         {
//             //console.log(req.body.Aadhar_Number);
//             // console.log(req.body.Date);
//             // console.log("true" + i);
//         }
//         else{
//             // console.log("false");
//         }
//     }
// })
})





app.listen(8000)
