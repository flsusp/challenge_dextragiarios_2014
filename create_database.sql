create role challenge_user with login unencrypted password '123mudar';

create database challenge owner challenge_user;

create table account (id serial primary key, balance decimal not null default 0);

create table product (id serial primary key, stock bigint not null default 0, price decimal not null);

create table negative_balance (account_id int not null references account(id), balance decimal not null, time timestamp not null);

create table negative_stock (product_id int not null references product(id), stock bigint not null, time timestamp not null);

CREATE FUNCTION sp_register_negative_balance() RETURNS TRIGGER AS $BODY$
BEGIN
    INSERT INTO negative_balance (account_id, balance, time) VALUES (OLD.id, NEW.balance, now());
	RETURN OLD;
END;
$BODY$ LANGUAGE 'plpgsql';

CREATE TRIGGER tg_register_negative_balance AFTER UPDATE ON account FOR EACH ROW WHEN (NEW.balance < 0)
EXECUTE PROCEDURE sp_register_negative_balance();


CREATE FUNCTION sp_register_negative_stock() RETURNS TRIGGER AS $BODY$
BEGIN
    INSERT INTO negative_stock (product_id, stock, time) VALUES (OLD.id, NEW.stock, now());
	RETURN OLD;
END;
$BODY$ LANGUAGE 'plpgsql';

CREATE TRIGGER tg_register_negative_stock AFTER UPDATE ON product FOR EACH ROW WHEN (NEW.stock < 0)
EXECUTE PROCEDURE sp_register_negative_stock();
