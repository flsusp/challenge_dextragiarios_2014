create role challenge_user with login unencrypted password '123mudar';

create database challenge owner challenge_user;

create table account (id serial primary key, balance decimal not null default 0);

create table product (id serial primary key, stock bigint not null default 0, price decimal not null);

