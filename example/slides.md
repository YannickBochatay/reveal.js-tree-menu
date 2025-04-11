# BASES DE DONNEES - LE LANGAGE SQL
(**S**tructured **Q**uery **L**anguage)
---

## Généralités

---
### Historique
Conçu dans les années 1970 par IBM, devenu le langage relationnel standard géré par presque tous les produits du marché.
- 1986 : SQL1, normalisé par l'[ANSI](https://fr.wikipedia.org/wiki/American_National_Standards_Institute) puis par l'[ISO](https://fr.wikipedia.org/wiki/Organisation_internationale_de_normalisation)
- 1992 : SQL2, version complète et utilisée par la plupart des SGBD actuels
- 1999 : SQL3 avec modèle objet-relationnel
- SQL:2003, SQL:2008, SQL:2011

---
### Les sous-langages
- DDL : langage de définition des données
- DML : langage de manipulation des données
- DCL : langage de contrôle des données

---
### Règles des identifiants
- ≤ 128 caractères
- commence par une lettre
- composé de lettres, chiffres, tirets-bas
- ne doit pas correspondre à un [mot réservé](https://www.ibm.com/docs/fr/psfa/7.1.0?topic=keywords-sql-common-reserved-words)

---
### Contournement
Bien que déconseillé, il est possible de contourner les règles. Les appels à l'identifiant doivent alors être entourés de guillemets doubles (standard) ou accents graves (MySQL).<!-- .element: class="left" -->
```sql
SELECT "1 SELECT %" FROM ma_table -- SQL standard

SELECT `1 SELECT %` FROM ma_table -- mySQL
```

---
### Syntaxe
- mots réservés insensibles à la casse, souvent écrits en majuscules
- chaînes de caractères délimitées par guillemets simples
- relations et attributs entourés d'accents graves s'ils ne respectent pas les règles de nommage

```sql
# correct
select "code_postal" from "ville" where nom='Toulouse'

# conseillé
SELECT code_postal FROM ville WHERE nom='Toulouse'
```


---
### Conventions de nommage
- caractères minuscules
- [snake case](https://fr.wikipedia.org/wiki/Snake_case)
- respecter les règles de nommage

```sql
SELECT nb_habitants FROM ville WHERE code_postal LIKE "31%"
```
---
## DDL : langage de définition des données

---
### Les tables
- Il est possible de créer, de modifier ou de supprimer des tables.
- La création des tables suppose la définition des attributs de la table, et l'expression des contraintes d'intégrité concernant la table.
- Lorsqu'une table est créée elle contient au moins un attribut et aucune ou plusieurs contraintes de table.

---
### Création
```sql
CREATE TABLE nom_table (
  attr_1 type1,
  attr_2 type2,
  ...)
```
Exemple
```sql
CREATE TABLE cinema (
  numero INT,
  ville VARCHAR(30)
)
```

---
### Contraintes d'intégrité
- `NOT NULL` : forcer la saisie
- `UNIQUE` : valeur unique
- `DEFAULT` : définit une valeur par défaut
- `CHECK` : spécifie une condition

---
#### Exemple

```sql
CREATE TABLE IF NOT EXISTS cinema (
  numero INT NOT NULL,
  nom VARCHAR(30),
  adresse VARCHAR(30) DEFAULT NULL,
  code_postal INT CHECK (code_postal BETWEEN 1000 AND 99999),
  ville VARCHAR(20) DEFAULT ’PARIS’,
  telephone VARCHAR(14)
);
```

---
### Clés primaires
```sql[|7]
CREATE TABLE cinema (
  numero INT NOT NULL,
  nom VARCHAR(30),
  adresse VARCHAR(30) DEFAULT NULL,
  code_postal INT CHECK (code_postal BETWEEN 1000 AND 99999),
  ville VARCHAR(20) DEFAULT ’PARIS’,
  PRIMARY KEY (numero, ville)
)
```

---
### Clés étrangères
```sql[|7|7-9]
CREATE TABLE cinema (
  numero INT NOT NULL,
  nom VARCHAR(30),
  adresse VARCHAR(30) DEFAULT NULL,
  code_postal INT CHECK (code_postal BETWEEN 1000 AND 99999),
  ville VARCHAR(20) DEFAULT ’PARIS’,
  FOREIGN KEY (ville) REFERENCES ville(nom)
  ON UPDATE CASCADE
  ON DELETE RESTRICT
)
```

---
### Modification d'une table
```
ALTER TABLE nom_table  
[ ADD (col_1 type1 [, col_2 type2 [, ...] ]) ]
[ DROP col_1 [, DROP col_2] , ... ]
[ RENAME COLUMN col_1 TO col_1_1]
[ ALTER attr_1 SET DEFAULT val_attr_1 ]
[ ALTER attr_1 DROP DEFAULT ]
[ ADD CONSTRAINT definition_contrainte ]
[ DROP CONSTRAINT nom_contrainte ]
```

---
### Suppression d'une table
```
DROP TABLE nom_table
```

---
### Les index
Primordiaux pour accélérer les opérations de recherche, de tri et de regroupement.  
Même idée qu'un index bibliographique.

![exemple d'index bibliographique](../assets/img/index.png)


---
#### Syntaxe
```sql
/* index unique (toutes les valeurs sont distinctes) */
CREATE UNIQUE INDEX nom_index ON nom_table (attribut_1)

/* index composite */
CREATE INDEX nom_index ON nom_table (attribut_1, attribut_2)

/* suppression d'un index */
DROP INDEX nom_index
```


---
### Les vues
Table dont les données ne sont pas physiquement stockées, mais qui se réfère à d'autres tables réelles.
On parle de table virtuelle.
---
#### Avantages
- dissocier et protéger l'accès aux tables en fonction des utilisateurs
- restreindre les droits d'accès à certaines parties de tables
- simplifier les requêtes complexes
- améliorer les performances des requêtes

---
#### Syntaxe
```sql
# Création
CREATE [OR REPLACE] VIEW nom_vue
AS requete_select

# Suppression
DROP VIEW [IF EXISTS] nom_vue
```
Exemple
```sql
CREATE VIEW cine_toulouse
AS SELECT * FROM cinema WHERE ville = 'Toulouse'
```

---
## DML - manipulation des données

---
### Requêtes de sélection simple
```sql
SELECT liste_attributs
FROM liste_tables
WHERE critere_de_selection
GROUP BY liste_attributs_groupe
HAVING critere_groupe
ORDER BY liste_attributs
```
Syntaxe minimale
```sql
SELECT liste_attributs
FROM liste_tables
```

---
#### La clause SELECT
```sql
SELECT [DISTINCT]
  attr_1 [AS nom_1],
  attr_2 [AS nom_2],
  ...
```
```sql
SELECT * 
```
- **DISTINCT** : permet d'éviter les doublons
- **AS** : renommage des attributs
- **\*** : sélection de tous les attributs

---
#### La clause FROM
Indique quelles relations sont utilisées par la requête
```sql
FROM table_1 [AS nom_1], table_2 [AS nom_2], ...
```
Si plusieurs relations &rarr; produit cartésien

---
#### La clause WHERE
Définit les critères de sélection
- opérateurs de comparaison : **<, >, >=, <=, =, <>**
- opérateurs logiques : **AND, OR, NOT, XOR**
- autres prédicats : **IN, BETWEEN ... AND ..., LIKE**
- comparaison avec NULL : **IS NULL, IS NOT NULL**
- caractères génériques :
  - '**_**' remplace 1 caractère
  - '**%**' remplace 0 à n caractères

---
#### Exemple complet
```sql
SELECT nom FROM cinema
WHERE ville = 'Toulouse' OR ville = 'Paris'
```
Equivalent à
```sql
SELECT nom FROM cinema
WHERE ville IN ('Toulouse', 'Paris')
```

---
### Les jointures

---
#### avec la clause WHERE
Jointure interne uniquement
```sql
SELECT cinema.nom, ville.nom, ville.nb_habitants
FROM cinema, ville
WHERE cinema.ville = ville.nom
```

---
#### avec l'opérateur JOIN
```sql
SELECT cinema.nom, ville.nom, ville.nb_habitants
FROM cinema [INNER|LEFT|RIGHT|FULL] JOIN ville
ON cinema.ville = ville.nom
```
---
#### avec l'opérateur JOIN
- **INNER JOIN** : jointure interne (par défaut)
- **LEFT JOIN** : jointure externe en gardant les n-uplets de la relation de gauche
- **RIGHT JOIN** : jointure externe en gardant les n-uplets de la relation de droite
- **OUTER JOIN** : jointure externe en gardant les n-uplets des 2 relations

---
#### avec l'opérateur JOIN
```sql[1-3|]
SELECT ville.nom, cinema.nom
FROM ville INNER JOIN cinema ON ville.nom = cinema.ville
WHERE ville.nom = 'Trou paumé'

/* Aucune ligne retournée */
```
```sql[1-3|]
SELECT ville.nom, cinema.nom
FROM ville LEFT JOIN cinema ON ville.nom = cinema.ville
WHERE ville.nom = 'Trou paumé'

/* 'Trou paumé', NULL */
```
<!-- .element: class="fragment" -->

---
### Les fonctions de groupe
|Nom|Fonction|
|-|-|
|**AVG, SUM**|Valeur moyenne, somme|
|**MIN, MAX**|Plus petite/grande valeur|
|**VARIANCE, STDDEV**|Variance, écart type|
|**COUNT**|Nombre de lignes|
|**GROUP_CONCAT**|Chaînes concaténées|
|**EVERY, ANY, SOME**|Booléen vrai si tout/un vrai|

---
#### Count
```sql
SELECT COUNT(*) FROM cinema
/* nombre de lignes dans la relation cinema */
```
```sql
SELECT COUNT(ville) FROM cinema
/* nombre de lignes dans la relation cinema
où la ville est renseignée (NOT NULL) */
```
<!-- .element: class="fragment" -->
```sql
SELECT COUNT(DISTINCT nom) FROM cinema
/* nombre de noms de cinemas différents */
```
<!-- .element: class="fragment" -->

---
#### La clause GROUP BY
- subdivise la table en groupes
- une seule ligne représente l'ensemble des n-uplets regroupés
```sql
SELECT ville, COUNT(*) FROM cinema GROUP BY ville

/* nombre de cinémas par ville */
```
```sql
SELECT departement, MAX(nb_habitants) FROM ville
GROUP BY departement

/* ville au plus grand nombre d'habitants par département */
```

---
#### La clause HAVING
sélection de groupes définis par la clause `GROUP BY`
```sql
SELECT ville, COUNT(*) FROM cinema
GROUP BY ville
HAVING COUNT(*) >= 5

/* nombre de cinémas par ville en possédant au moins 5*/
```

---
### La clause ORDER
Tri des n-uplets
```sql
ORDER BY Expr1 [DESC], Expr2 [DESC], ...
```
Exemple
```sql
SELECT nom, ville FROM cinema
ORDER BY ville, nom
```

---
### Les clauses LIMIT et OFFSET
Décalage et nombre maximal de résultats
```sql
SELECT nom, ville FROM cinema LIMIT 5 OFFSET 4
```
Affiche les n-uplets 5 à 9

---
### Les sous-requêtes
Prédicat à l'aide du résultat d'un `SELECT`
```sql
SELECT ville, COUNT(*) FROM cinema
WHERE ville IN (
  SELECT nom FROM ville WHERE nb_habitants > 50000
)
GROUP BY ville
```

---
#### Sous-requêtes vs jointures
Exemple précédent équivalent à :
```sql
SELECT cinema.ville, COUNT(*)
FROM cinema JOIN ville ON cinema.ville = ville.nom
WHERE nb_habitants > 50000
GROUP BY ville
```
- avantage de la sous-requête : lisibilité
- inconvénient : performances

---
#### Sous-requêtes synchronisées
```sql
SELECT DISTINCT nom FROM cinema AS C1
WHERE nom = (
  SELECT DISTINCT nom FROM cinema AS C2
  WHERE C2.nom = C1.nom
  AND C2.ville <> C1.ville
)

/* noms des cinémas apparaissant dans plusieurs villes */
```
Référence à une colonne de la requête principale

&rarr; réévaluation de la sous-requête pour chaque n-uplet

---
#### CLAUSE EXISTS
```sql
SELECT DISTINCT nom FROM cinema AS C1
WHERE EXISTS (
  SELECT DISTINCT nom FROM cinema AS C2
  WHERE C2.nom = C1.nom
  AND C2.ville <> C1.ville
)
```
Vraie si la sous-requête renvoie au moins un n-uplet

---
### Opérateurs ensemblistes

---
#### Union
```sql
SELECT nom FROM cinema WHERE ville = 'Paris'
UNION
SELECT nom FROM cinema WHERE ville = 'Toulouse'
```
Equivalent à 
```sql
SELECT nom FROM cinema
WHERE ville = 'Paris' OR ville = 'Toulouse'
```

---
#### Intersection
```sql
SELECT nom FROM cinema WHERE ville = 'Paris'
INTERSECT
SELECT nom FROM cinema WHERE ville = 'Toulouse'

/* Nom des cinémas qui apparaissent à Toulouse et Paris */
```
Remarque : le choix des attributs est fondamental

---
#### Différence
```sql
SELECT nom FROM cinema WHERE ville = 'Toulouse'
EXCEPT
SELECT nom FROM cinema WHERE ville = 'Paris'

/* Nom des cinémas qui apparaissent à Toulouse
   mais pas à Paris */
```

---
#### Division
Pas d'opérateur spécifique en SQL. Deux solutions :
- avec la fonction d'agrégation COUNT
- avec la clause EXISTS

[Plus d'infos](https://sqlpro.developpez.com/cours/divrelationnelle/)
<!-- .element: class="link" -->

---
### Fonctions mathématiques
|Opérateur|Description|
|-|-|
|ABS|valeur absolue|
|CEIL, FLOOR, ROUND | entiers les plus proches |
|POWER(a,b)|a élevé à la puissance b|
|COS|cosinus|
|...|...|

&rarr; Références :
[PostgreSQL](https://docs.postgresql.fr/14/functions-math.html) / 
[MySQL](https://dev.mysql.com/doc/refman/8.4/en/numeric-functions.html)

---
### Fonctions sur les chaînes
|Opérateur|Description|
|-|-|
|CONCAT(str1,str2,...)|concaténation|
|LOWER, UPPER|changement de casse|
|TRIM|suppression des espaces avant/après|
|LENGTH|longueur de la chaîne|
|...|...|

&rarr; Références :
[PostgreSQL](https://docs.postgresql.fr/14/functions-string.html) / 
[MySQL](https://dev.mysql.com/doc/refman/8.4/en/string-functions.html)

---
### Opérateur LIKE
#### Correspondance de motif
- '**_**' remplace 1 caractère  
- '**%**' remplace 0 à n caractères

```sql
SELECT nom FROM cinema WHERE ville LIKE 'Tou%'
```

---
### Fonctions sur les dates
Peu de fonctions communes aux différents SGBD

&rarr; Références :
[PostgreSQL](https://docs.postgresql.fr/14/functions-datetime.html) / 
[MySQL](https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html)

---
### Requêtes de mise à jour de données