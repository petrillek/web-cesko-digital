# Style Guide

- V dokumentaci, pull requestech a issues používejte češtinu, v commitech a zdrojovém kódu angličtinu.
- Zapněte si automatické formátování kódu pomocí Prettier. Nemusíme všichni souhlasit se všemi změnami, které Prettier udělá, ale nechat to na něm je lepší než se o tom donekonečna přít :)

# Zdroje dat

- Web načítá data přes API z [Airtable](https://airtable.com).
- Abyste nemuseli řešit klíče pro přístup k API, existuje také lokální kopie dat (viz `content/samples/`), která se automaticky použije, když není k dispozici klíč k Airtable.
- Pokud chcete lokální data aktualizovat z Airtable, spusťte `yarn update-data`.
- Pokud chcete vynutit použití lokálních dat, i když máte klíč k Airtable, nastavte proměnnou prostředí `DATA_SOURCE_LOCAL`, například `DATA_SOURCE_LOCAL=1 yarn dev`. Takhle si můžete snadno vyzkoušet například změny DB schématu.
- Pokud máte API klíč k Airtable, uložte ho do proměnné `AIRTABLE_API_KEY`. Nejen tahle proměnná se dá elegantně nastavit pomocí souboru `.env.local`, [viz dokumentaci Next.js](https://nextjs.org/docs/basic-features/environment-variables#loading-environment-variables).
- Více úvah o databázích [najdete na wiki](https://github.com/cesko-digital/web/wiki/Databáze).

# Testy

Máme k dispozici následující hierarchii testů:

1. Typový systém (`yarn typecheck`)
2. Jednotkové (unit) testy (`yarn test`)
3. End-to-end (E2E) testy (`yarn test:e2e`)

Čím vyšší číslo v téhle hierarchii test má, tím déle trvá a je potenciálně křehčí (snáz se rozbije). Snažte se proto pohybovat co nejníže – pokud jde pro něco napsat unit test namísto E2E testu, je to lepší. A pokud jde danou invariantu vystihnout přímo v typovém systému, je to úplně nejlepší.

# Přihlašování

Pokud potřebujete pracovat na autentizované části webu, narazíte na problém s OAuth flow, které není dělané na lokální vývoj. Dá se to
obejít tím, že se přihlásíte na produkčním webu a zkopírujete si na lokální web autentizační cookie (`__Secure-next-auth.session-token`).

# Poznámky k architektuře

- Nebojte se psát delší soubory. Mít každou drobnost v samostatném souboru je čistě režie navíc. Lze i zobecnit – míra „procesů“ (abstrakce, dělení do souborů, dělení do funkcí, …) musí odpovídat velikosti řešeného problému. Pokud zakládáte nový soubor kvůli čtyřem řádkům kódu, je slušná šance, že děláte něco špatně.
- Dvakrát se zamyslete, než přidáte novou závislost. Třikrát, pokud má sama nějaké další závislosti. Pokud jde o vyloženě větší závislost (React, GraphQL, …), domluvme se předem, jestli je to opravdu nutné. Pokud jde místo další závislosti napsat funkce o 10–20 řádcích, je to výrazně lepší. Velký počet závislostí zpomaluje build a celkově zhoršuje ergonomii práce na projektu.
