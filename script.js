const inquirer = require("inquirer");
const fs = require("fs");
const cTable = require("console.table");
const mysql2 = require("mysql2");
const figlet = require("figlet");



const connection = mysql2.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'MyServer456%',
    database: 'employee_db'
});


connection.connect(err =>{
   if (err) throw err
    console.log('connected as id ' + connection.threadId + '\n');
    return;

});

function startApp() {
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "choice",
            choices: [

                    "View All Employees?",
                    "View All Employees by Roles?",
                    "View All Employees by Departments",
                    "Update Employee Role?",
                    "Add Employee?",
                    "Add Role?",
                    "Add Department",
                    "Remove Department",
                    "Exit"
                     ]
        }
    ]).then(function(input) {
        switch(input.choice) {
            case "View All Employees?":
                viewAllEmployees();
                break;
            case "View All Employees by Roles?":
                viewAllRoles()
                break;
            case "View All Employees by Departments":
                viewAllDepartments()
                break; 
            case "Update Employee Role?":
                updateEmployeeRole();           
                break;
            case "Add Employee?":
                employeeAdd();
                break;
            case "Add Role?":
                roleAdd();
                break;
            case "Add Department":
                departmentAdd();
                break;
            case "Remove Department":
                departDelete();
                break;
            case "Exit":
                connection.end();
                break;
        }
    })
}



function viewAllEmployees() {
    connection.query(
        `SELECT * FROM employee`, 
        function(err,res) {
            if(err) 
                throw err;
            console.table(res)
            startApp();

        });
}

//--------View All Roles----------//

function viewAllRoles() {
    connection.query(`
    SELECT employee.first_name, employee.last_name, roles.title 
    AS Title 
    FROM employee 
    JOIN roles 
    ON employee.role_id = roles.id;`,
    function(err,res) {
        if(err) 
            throw err;
        console.table(res)
        startApp();

    });
}

//------Department Viewer-------//

function viewAllDepartments() {
    connection.query(`
    SELECT first_name, last_name, department.name
    FROM ((employee INNER JOIN roles ON role_id = roles.id) INNER JOIN department ON department_id = department.id);`,
    function(err,res) {
        if(err) 
            throw err;
        console.table(res)
        startApp();

    });
}


//------Employee Update-------//

function updateEmployeeRole() {
    connection.query("SELECT * FROM roles", 
        function(err, res) {
            if (err) 
                throw err;
            
        inquirer.prompt([
            {
              type: "list",
              message: "What Role do you want to change>",
              name: "roleChoices",
              choices: res.map((data) => data.title),
            },
            {
              type: "input",
              message: "which role do you want to change it to?",
              name: "roleChange",
            },
          ])
          .then((val) => {
            connection.query(
              `UPDATE roles SET title= '${val.roleChange}' WHERE title='${val.roleChoices}'`,
              function(err, data) {
                if (err) 
                    throw err;
                console.table(val);
                startApp();
              }
            );
          });
      });
}



//-------Employee Add--------//

var roleArray = [];
function selectRole() {
    connection.query("SELECT * FROM roles", function(err, res) {
        if (err) 
            throw err;
        for (var i = 0; i < res.length; i++) {
            roleArray.push(res[i].title);
        }
    });
    return roleArray;
}

var manArray = [];
function managerId() {
    connection.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL",
    function(err, res) {
        if (err)
            throw err;
        for (var i = 0; i < res.length; i++) {
            manArray.push(res[i].first_name);
        }
    });
    return manArray;
}

function employeeAdd() {
    //const departments = connection.query("SELECT * FROM department");
    inquirer.prompt([
        {
            type: "input",
            name: "firstName",
            message: "Enter employee's first name:"
        },
        {
            type: "input",
            name: "lastName",
            message: "Enter employee's last name:"
        },
        {
            type: "list",
            name: "roleEmploy",
            message: "Enter employee's Role: ",
            choices: selectRole()
            
        },
        {
            type: "list",
            name: "managerChoice",
            message: "Enter Manager's name: ",
            choices: managerId(),
            
        }
        ]).then(function (val) {
            var roleId = selectRole().indexOf(val.roleEmploy) + 1
            var managerChoice = managerId().indexOf(val.managerChoice) + 1
            connection.query("INSERT INTO employee SET ?", 
            {
                first_name: val.firstName,
                last_name: val.lastName,
                manager_id: managerChoice,
                role_id: roleId
                
            }, function(err){
                if (err) 
                    throw err;
                console.table(val);
                startApp();
            });
        
        });
}


//-------Add Role-------//
function roleAdd() {
    connection.query("SELECT roles.title AS Title, roles.salary AS Salary FROM roles", 
    function(err, res) {
        inquirer.prompt([
        {
            type: "input",
            name: "Title",
            message: "Enter role title: "
        },
        {
            type: "input",
            name: "Salary",
            message: "Enter your salary: "
        }
        ]).then(function(val) {
            connection.query("INSERT INTO roles SET ?",
            {
                title: val.Title,
                salary: val.Salary
            },
            function(err) {
                if(err)
                    throw err;
                console.table(val);
                startApp();
            });
        })
    });

};


//-----Add Department------//

function departmentAdd() {
    inquirer.prompt([
        {
            type: "input",
            name: "Department",
            message: "Enter department name:" 
        }
    ]).then(function(val) {
        connection.query("INSERT INTO department SET ? ",
        {
            name: val.Department
        },
        function(err) {
            if(err)
                throw err;
            console.table(val);
            startApp();
        });
    });
    
};

//-------Delete Department--------//


function departDelete() {
    connection.query("SELECT * FROM department",
    function(err, res) {
        if(err)
            throw err;
        inquirer.prompt([
        {
            name: "depart",
            type: "list",
            choices: function() {
                let arrayChoice = res.map((choice) => choice.name);
                return arrayChoice;
            },
            message: "Select departments to remove: "
        }
        ])
        .then((val) => {
            connection.query('DELETE FROM department WHERE ? ', {
                name: val.depart
            });       
               
            startApp();
        });
        
    });   
}



startApp();