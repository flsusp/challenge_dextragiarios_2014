create database challenge owner challenge_user;

drop table transfers;
drop table stock;
drop table product;
drop table account;

create role challenge_user with login unencrypted password '123mudar';

create table account (id serial primary key, nome varchar(30));

create table transfers (id serial primary key, idAccount int references account(id), relativeValue decimal not null default 0, consolidada boolean default false);

create table product (id serial primary key, price decimal not null);
create table stock (id serial primary key, idProduct int references product(id), relativeQuantity bigint not null default 0, consolidada boolean default false);


drop table transfers;drop table stock;drop table product;drop table account;

insert into account (16, 'asd');
insert into product values(1,1);
insert into product values(2,2);
insert into product values(3,3);
insert into product values(4,4);