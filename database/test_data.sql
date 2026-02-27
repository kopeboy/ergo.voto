-- Test data for realistic arguments
-- Run this in Directus SQL console or PostgreSQL client

-- First, create a test debate
INSERT INTO debates (topic, type, question, intro, status, user_created)
VALUES (
    'Intelligenza Artificiale nella Sanità',
    'question',
    'L''uso dell''intelligenza artificiale dovrebbe essere obbligatorio per le diagnosi mediche?',
    'L''intelligenza artificiale sta rivoluzionando il settore sanitario, offrendo strumenti sempre più precisi per la diagnosi e il trattamento delle malattie. Tuttavia, emergono questioni etiche e pratiche riguardo la sua implementazione obbligatoria.',
    'published',
    (SELECT id FROM directus_users LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Get the debate ID (adjust this based on your actual debate ID)
-- For this example, we'll use debate_id = 1

-- Root arguments (Pro - Sì)
INSERT INTO arguments (debate, parent, argument, is_objection, vote_score, user_created)
VALUES 
(
    1,
    NULL,
    'L''intelligenza artificiale ha dimostrato di raggiungere tassi di accuratezza diagnostica superiori al 95% in molte specialità mediche, superando significativamente le performance dei medici umani in condizioni controllate. Studi recenti pubblicati su Nature Medicine mostrano che i sistemi di AI possono identificare tumori in fase precoce con una precisione del 97%, riducendo drasticamente i falsi negativi che potrebbero costare vite umane.',
    false,
    15,
    (SELECT id FROM directus_users LIMIT 1)
),
(
    1,
    NULL,
    'L''implementazione dell''AI ridurrebbe significativamente i costi sanitari a lungo termine. Secondo uno studio del McKinsey Global Institute, l''automazione diagnostica potrebbe far risparmiare al sistema sanitario globale fino a 150 miliardi di dollari all''anno entro il 2030, liberando risorse per trattamenti e prevenzione. Inoltre, l''AI può analizzare migliaia di casi in pochi secondi, riducendo i tempi di attesa per i pazienti.',
    false,
    12,
    (SELECT id FROM directus_users LIMIT 1)
),
(
    1,
    NULL,
    'La standardizzazione delle diagnosi attraverso l''AI eliminerebbe le disparità regionali nell''accesso alle cure di qualità. Attualmente, la qualità della diagnosi dipende fortemente dall''esperienza del medico locale, creando ingiustizie tra aree urbane e rurali. Un sistema di AI centralizzato garantirebbe lo stesso livello di eccellenza diagnostica ovunque, democratizzando l''accesso alla medicina di precisione.',
    false,
    8,
    (SELECT id FROM directus_users LIMIT 1)
);

-- Root arguments (Contro - No)
INSERT INTO arguments (debate, parent, argument, is_objection, vote_score, user_created)
VALUES 
(
    1,
    NULL,
    'L''intelligenza artificiale manca della capacità di comprendere il contesto umano completo che è fondamentale per una diagnosi accurata. I medici considerano non solo i sintomi fisici, ma anche fattori psicologici, sociali e ambientali che un algoritmo non può cogliere. La medicina non è solo scienza dei dati, ma anche arte dell''ascolto e dell''empatia, elementi che nessuna AI può replicare.',
    true,
    -18,
    (SELECT id FROM directus_users LIMIT 1)
),
(
    1,
    NULL,
    'I sistemi di AI sono vulnerabili a bias sistemici derivanti dai dati di addestramento. Se i dataset utilizzati per addestrare l''AI contengono prevalentemente dati di popolazioni specifiche (ad esempio, caucasici maschi), il sistema potrebbe essere meno accurato per donne, minoranze etniche o gruppi sottorappresentati. Questo potrebbe aggravare le disuguaglianze sanitarie esistenti invece di risolverle.',
    true,
    -14,
    (SELECT id FROM directus_users LIMIT 1)
),
(
    1,
    NULL,
    'La responsabilità legale in caso di errore diagnostico diventa estremamente problematica con l''AI obbligatoria. Chi è responsabile se l''algoritmo sbaglia: il programmatore, l''ospedale, il medico che ha seguito le indicazioni dell''AI? Questa zona grigia legale potrebbe paralizzare il sistema giudiziario e lasciare i pazienti danneggiati senza possibilità di ricorso adeguato.',
    true,
    -10,
    (SELECT id FROM directus_users LIMIT 1)
);

-- Child arguments (Confirmations and Objections to the first Pro argument)
INSERT INTO arguments (debate, parent, argument, is_objection, vote_score, user_created)
VALUES 
(
    1,
    (SELECT id FROM arguments WHERE debate = 1 AND parent IS NULL AND is_objection = false ORDER BY id LIMIT 1),
    'Oltre alla diagnosi oncologica, l''AI eccelle anche nella rilevazione di malattie cardiovascolari, diabete e patologie neurologiche. Il sistema Watson di IBM ha dimostrato di identificare mutazioni genetiche rare in pazienti oncologici con una precisione del 96%, suggerendo terapie personalizzate che i medici non avrebbero considerato. Questo salva vite e migliora la qualità della vita dei pazienti.',
    false,
    7,
    (SELECT id FROM directus_users LIMIT 1)
),
(
    1,
    (SELECT id FROM arguments WHERE debate = 1 AND parent IS NULL AND is_objection = false ORDER BY id LIMIT 1),
    'Gli studi citati sono stati condotti in ambienti controllati e non riflettono la complessità della pratica clinica reale. In condizioni di laboratorio, l''AI può eccellere, ma nella realtà quotidiana degli ospedali, con dati incompleti, pazienti non collaborativi e situazioni di emergenza, le performance crollano significativamente. Uno studio del 2023 su JAMA ha mostrato che l''accuratezza dell''AI scende al 78% in contesti clinici reali.',
    true,
    -5,
    (SELECT id FROM directus_users LIMIT 1)
);

-- Child arguments for the first Contro argument
INSERT INTO arguments (debate, parent, argument, is_objection, vote_score, user_created)
VALUES 
(
    1,
    (SELECT id FROM arguments WHERE debate = 1 AND parent IS NULL AND is_objection = true ORDER BY id LIMIT 1),
    'Esattamente, e questo è particolarmente critico in psichiatria e medicina generale, dove la relazione medico-paziente è terapeutica in sé. Un paziente che si sente ascoltato e compreso ha migliori outcome clinici, indipendentemente dalla diagnosi tecnica. L''AI potrebbe ridurre la medicina a un processo meccanico, perdendo la dimensione umana che è parte integrante della guarigione.',
    false,
    6,
    (SELECT id FROM directus_users LIMIT 1)
),
(
    1,
    (SELECT id FROM arguments WHERE debate = 1 AND parent IS NULL AND is_objection = true ORDER BY id LIMIT 1),
    'L''AI può essere programmata per considerare fattori contestuali attraverso questionari strutturati e analisi multimodale che include dati socio-economici, storia familiare e stile di vita. Sistemi moderni di AI utilizzano Natural Language Processing per analizzare le note cliniche e identificare pattern che un medico potrebbe perdere. L''empatia non diagnostica malattie, i dati sì.',
    true,
    -4,
    (SELECT id FROM directus_users LIMIT 1)
);

-- Update vote_score using the trigger (this will recalculate based on actual votes if any exist)
-- The vote_score values above are just initial test values
