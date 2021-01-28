USE employee_db;

INSERT INTO department (name)
VALUES ("Sales"), ("Engineer"), ("Finance"), ("Legal");

INSERT INTO roles (title, salary, department_id)
VALUES 
("Saleslead", 150000, 1), 
("Lead Engineer", 250000, 2),
("Accountant", 125000, 3),
("Salesperson", 80000, 4);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
("Joe", "Mama", 1, NULL), 
("Yolo", "Swag", 2, 2),
("Big", "Chungus", 3, 3),
("Yo", "Papa", 4, 4);


SELECT * FROM department;
SELECT * FROM roles;
SELECT * FROM employee;
