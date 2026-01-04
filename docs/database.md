# Database

## Option 1 : From inside the container (where you already are)

You are already in the container, use: `mysql -u root -p#` Enter the password: `rootpassword#` Or directly with the password: `mysql -u root -prootpassword`

## Option 2 : From outside the container (from your host)

From your host machine: `docker exec -it dvb-probe-mariadb mysql -u root -prootpassword#` Or to access the specific database: `docker exec -it dvb-probe-mariadb mysql -u root -prootpassword dvb_probe`

## Option 3 : Verify the actual password

If you changed the password via an environment variable, check it:
From the host, check the container's environment variables: `docker exec dvb-probe-mariadb env | grep MYSQL`
Useful commands once connected

-- See all the databases
SHOW DATABASES;

-- Use the database dvb_probe

```sql
USE dvb_probe;
```

-- See all the tables

```sql
SHOW TABLES;
```

-- See the logs of the probe 4

```sql
SELECT * FROM probe_logs WHERE probe_id = 4 ORDER BY timestamp DESC;
```

-- See all the probes

```sql
SELECT * FROM probes;
```

Try from the container:
mysql -u root -prootpassword
