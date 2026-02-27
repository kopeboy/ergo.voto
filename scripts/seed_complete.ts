import { createDirectus, rest, createItem, authentication, readItems } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
	.with(rest())
	.with(authentication('json'));

async function seedCompleteData() {
	try {
		console.log('Logging in to Directus...');
		await directus.login({ email: 'io@io.io', password: 'io' });
		console.log('✅ Logged in successfully\n');
		
		console.log('Creating test debate...');
		
		const debate = await directus.request(
			createItem('debates', {
				topic: 'Intelligenza Artificiale nella Sanità',
				type: 'question',
				question: 'L\'uso dell\'intelligenza artificiale dovrebbe essere obbligatorio per le diagnosi mediche?',
				intro: 'L\'intelligenza artificiale sta rivoluzionando il settore sanitario, offrendo strumenti sempre più precisi per la diagnosi e il trattamento delle malattie. Tuttavia, emergono questioni etiche e pratiche riguardo la sua implementazione obbligatoria.',
				status: 'published'
			})
		);

		console.log(`✅ Debate created with ID: ${debate.id}`);

		// Create 5 Pro arguments
		const proArgs = [
			{ text: 'L\'AI raggiunge tassi di accuratezza diagnostica superiori al 95% in molte specialità mediche, superando le performance dei medici umani.', score: 15 },
			{ text: 'L\'implementazione dell\'AI ridurrebbe i costi sanitari fino a 150 miliardi di dollari all\'anno entro il 2030.', score: 12 },
			{ text: 'La standardizzazione eliminerebbe le disparità regionali nell\'accesso alle cure di qualità.', score: 8 },
			{ text: 'L\'AI può analizzare migliaia di casi in pochi secondi, riducendo drasticamente i tempi di attesa.', score: 10 },
			{ text: 'I sistemi di AI possono lavorare 24/7 senza affaticamento, garantendo diagnosi costanti.', score: 7 }
		];

		console.log('Creating Pro arguments...');
		const createdProArgs = [];
		for (const arg of proArgs) {
			const created = await directus.request(
				createItem('arguments', {
					debate: debate.id,
					argument: arg.text,
					is_objection: false,
					vote_score: arg.score,
					status: 'published'
				})
			);
			createdProArgs.push(created);
			console.log(`  ✅ Pro argument ${created.id}: ${arg.text.substring(0, 50)}...`);
		}

		// Create 5 Contro arguments
		const controArgs = [
			{ text: 'L\'AI non può sostituire il giudizio clinico umano che considera il contesto completo del paziente.', score: 14 },
			{ text: 'I sistemi di AI possono perpetuare bias presenti nei dati di addestramento, discriminando alcune popolazioni.', score: 11 },
			{ text: 'La responsabilità legale in caso di errori diagnostici dell\'AI non è ancora chiara.', score: 9 },
			{ text: 'L\'implementazione obbligatoria richiederebbe investimenti enormi che molti ospedali non possono permettersi.', score: 8 },
			{ text: 'La dipendenza dall\'AI potrebbe ridurre le competenze diagnostiche dei medici nel tempo.', score: 6 }
		];

		console.log('Creating Contro arguments...');
		const createdControArgs = [];
		for (const arg of controArgs) {
			const created = await directus.request(
				createItem('arguments', {
					debate: debate.id,
					argument: arg.text,
					is_objection: true,
					vote_score: arg.score,
					status: 'published'
				})
			);
			createdControArgs.push(created);
			console.log(`  ✅ Contro argument ${created.id}: ${arg.text.substring(0, 50)}...`);
		}

		// Add 8 confirmations to first Pro argument
		console.log('\nAdding confirmations to first Pro argument...');
		const confirmations1 = [
			{ text: 'Uno studio su 10.000 mammografie ha mostrato che l\'AI ha ridotto i falsi positivi del 30%.', score: 8 },
			{ text: 'In dermatologia, l\'AI identifica melanomi con precisione superiore ai dermatologi esperti.', score: 7 },
			{ text: 'L\'AI ha dimostrato efficacia nell\'identificazione precoce di sepsi, salvando migliaia di vite.', score: 6 },
			{ text: 'Nei test clinici, l\'AI ha ridotto gli errori diagnostici del 40% rispetto alla pratica standard.', score: 5 },
			{ text: 'L\'analisi di immagini radiologiche con AI è già standard in molti ospedali leader.', score: 4 },
			{ text: 'L\'AI può rilevare pattern invisibili all\'occhio umano nelle scansioni mediche.', score: 3 },
			{ text: 'La combinazione di AI e medici umani produce i migliori risultati diagnostici.', score: 2 },
			{ text: 'L\'AI ha superato i test di certificazione medica in diverse specialità.', score: 1 }
		];

		for (const conf of confirmations1) {
			await directus.request(
				createItem('arguments', {
					debate: debate.id,
					parent: createdProArgs[0].id,
					argument: conf.text,
					is_objection: false,
					vote_score: conf.score,
					status: 'published'
				})
			);
		}
		console.log(`  ✅ Added ${confirmations1.length} confirmations`);

		// Add 7 objections to first Pro argument
		console.log('Adding objections to first Pro argument...');
		const objections1 = [
			{ text: 'Gli studi sull\'accuratezza dell\'AI sono spesso condotti in condizioni ideali, non realistiche.', score: 9 },
			{ text: 'Il 95% di accuratezza significa ancora 5% di errori, inaccettabile per diagnosi critiche.', score: 7 },
			{ text: 'L\'AI non può spiegare il suo ragionamento, rendendo difficile verificare le diagnosi.', score: 6 },
			{ text: 'I dataset di addestramento non rappresentano adeguatamente tutte le popolazioni.', score: 5 },
			{ text: 'L\'AI fallisce in casi atipici che richiedono creatività diagnostica.', score: 4 },
			{ text: 'La tecnologia è ancora troppo nuova per essere resa obbligatoria.', score: 3 },
			{ text: 'Gli errori dell\'AI possono essere sistematici e difficili da individuare.', score: 2 }
		];

		for (const obj of objections1) {
			await directus.request(
				createItem('arguments', {
					debate: debate.id,
					parent: createdProArgs[0].id,
					argument: obj.text,
					is_objection: true,
					vote_score: obj.score,
					status: 'published'
				})
			);
		}
		console.log(`  ✅ Added ${objections1.length} objections`);

		// Add children to second Pro argument
		console.log('\nAdding children to second Pro argument...');
		const confirmations2 = [
			{ text: 'Il risparmio include riduzione di test duplicati e diagnosi più rapide.', score: 6 },
			{ text: 'L\'automazione libera tempo medico per attività a maggior valore aggiunto.', score: 5 },
			{ text: 'Minori errori diagnostici significano minori costi di trattamenti errati.', score: 4 }
		];

		for (const conf of confirmations2) {
			await directus.request(
				createItem('arguments', {
					debate: debate.id,
					parent: createdProArgs[1].id,
					argument: conf.text,
					is_objection: false,
					vote_score: conf.score,
					status: 'published'
				})
			);
		}

		const objections2 = [
			{ text: 'I costi iniziali di implementazione sono proibitivi per la maggior parte degli ospedali.', score: 8 },
			{ text: 'I risparmi stimati non considerano i costi di manutenzione e aggiornamento continui.', score: 6 },
			{ text: 'La formazione del personale per usare l\'AI richiede investimenti significativi.', score: 4 },
			{ text: 'I fornitori di tecnologia AI hanno incentivi a gonfiare le stime di risparmio.', score: 3 }
		];

		for (const obj of objections2) {
			await directus.request(
				createItem('arguments', {
					debate: debate.id,
					parent: createdProArgs[1].id,
					argument: obj.text,
					is_objection: true,
					vote_score: obj.score,
					status: 'published'
				})
			);
		}
		console.log(`  ✅ Added ${confirmations2.length} confirmations and ${objections2.length} objections`);

		// Add children to first Contro argument
		console.log('\nAdding children to first Contro argument...');
		const confirmations3 = [
			{ text: 'Il rapporto medico-paziente richiede empatia che l\'AI non può fornire.', score: 7 },
			{ text: 'I medici considerano fattori sociali e psicologici che l\'AI ignora.', score: 6 },
			{ text: 'La medicina è un\'arte oltre che una scienza, richiede intuizione umana.', score: 5 },
			{ text: 'L\'AI non può adattarsi a situazioni uniche come fa un medico esperto.', score: 4 },
			{ text: 'Il giudizio clinico include valutazioni etiche che l\'AI non può fare.', score: 3 }
		];

		for (const conf of confirmations3) {
			await directus.request(
				createItem('arguments', {
					debate: debate.id,
					parent: createdControArgs[0].id,
					argument: conf.text,
					is_objection: false,
					vote_score: conf.score,
					status: 'published'
				})
			);
		}

		const objections3 = [
			{ text: 'L\'AI può assistere i medici senza sostituire il loro giudizio finale.', score: 8 },
			{ text: 'Molte decisioni diagnostiche sono basate su pattern riconoscibili dall\'AI.', score: 6 },
			{ text: 'L\'empatia è importante ma separata dall\'accuratezza diagnostica.', score: 5 },
			{ text: 'L\'AI può fornire una seconda opinione preziosa per decisioni complesse.', score: 4 }
		];

		for (const obj of objections3) {
			await directus.request(
				createItem('arguments', {
					debate: debate.id,
					parent: createdControArgs[0].id,
					argument: obj.text,
					is_objection: true,
					vote_score: obj.score,
					status: 'published'
				})
			);
		}
		console.log(`  ✅ Added ${confirmations3.length} confirmations and ${objections3.length} objections`);

		// Add children to second Contro argument
		console.log('\nAdding children to second Contro argument...');
		const confirmations4 = [
			{ text: 'I dataset storici riflettono disparità razziali e di genere nella medicina.', score: 6 },
			{ text: 'L\'AI addestrata su popolazioni specifiche fallisce con altre etnie.', score: 5 },
			{ text: 'Casi documentati mostrano AI che discrimina pazienti di colore.', score: 4 }
		];

		for (const conf of confirmations4) {
			await directus.request(
				createItem('arguments', {
					debate: debate.id,
					parent: createdControArgs[1].id,
					argument: conf.text,
					is_objection: false,
					vote_score: conf.score,
					status: 'published'
				})
			);
		}

		const objections4 = [
			{ text: 'I bias possono essere identificati e corretti con dataset più diversificati.', score: 7 },
			{ text: 'L\'AI può ridurre bias umani inconsci dei medici.', score: 5 },
			{ text: 'Tecniche di fairness nell\'AI stanno migliorando rapidamente.', score: 4 },
			{ text: 'Il problema del bias esiste anche nella medicina tradizionale.', score: 3 }
		];

		for (const obj of objections4) {
			await directus.request(
				createItem('arguments', {
					debate: debate.id,
					parent: createdControArgs[1].id,
					argument: obj.text,
					is_objection: true,
					vote_score: obj.score,
					status: 'published'
				})
			);
		}
		console.log(`  ✅ Added ${confirmations4.length} confirmations and ${objections4.length} objections`);

		// Add level 3 arguments (children of level 2 confirmations)
		console.log('\nAdding level 3 arguments (children of first confirmation)...');
		
		// Get first confirmation of first Pro argument for level 3
		const level2Confirmations = await directus.request(
			readItems('arguments', {
				filter: {
					parent: { _eq: createdProArgs[0].id },
					is_objection: { _eq: false }
				},
				sort: ['-vote_score'],
				limit: 1
			})
		);

		if (level2Confirmations.length > 0) {
			const level2Parent = level2Confirmations[0];
			
			const level3Args = [
				{ text: 'Meta-analisi di 50 studi conferma superiorità AI in imaging diagnostico.', score: 5, is_objection: false },
				{ text: 'FDA ha già approvato 100+ dispositivi medici basati su AI.', score: 4, is_objection: false },
				{ text: 'Ma gli studi sono finanziati dalle aziende produttrici di AI.', score: 6, is_objection: true },
				{ text: 'I risultati non sono replicabili in contesti ospedalieri reali.', score: 4, is_objection: true }
			];

			for (const arg of level3Args) {
				const created = await directus.request(
					createItem('arguments', {
						debate: debate.id,
						parent: level2Parent.id,
						argument: arg.text,
						is_objection: arg.is_objection,
						vote_score: arg.score,
						status: 'published'
					})
				);
				
				// Add level 4 to first level 3 confirmation
				if (!arg.is_objection && arg.score === 5) {
					const level4Args = [
						{ text: 'Revisione indipendente Cochrane conferma i risultati.', score: 3, is_objection: false },
						{ text: 'Anche studi non finanziati mostrano risultati simili.', score: 2, is_objection: false },
						{ text: 'Ma mancano studi su popolazioni diverse.', score: 4, is_objection: true }
					];
					
					for (const l4arg of level4Args) {
						await directus.request(
							createItem('arguments', {
								debate: debate.id,
								parent: created.id,
								argument: l4arg.text,
								is_objection: l4arg.is_objection,
								vote_score: l4arg.score,
								status: 'published'
							})
						);
					}
					console.log(`    ✅ Added ${level4Args.length} level 4 arguments`);
				}
			}
			console.log(`  ✅ Added ${level3Args.length} level 3 arguments`);
		}

		// Add more level 3 to a Contro argument
		console.log('\nAdding level 3 arguments to Contro side...');
		const level2ObjControl = await directus.request(
			readItems('arguments', {
				filter: {
					parent: { _eq: createdControArgs[0].id },
					is_objection: { _eq: true }
				},
				sort: ['-vote_score'],
				limit: 1
			})
		);

		if (level2ObjControl.length > 0) {
			const level3ControArgs = [
				{ text: 'Studi dimostrano che medici ignorano suggerimenti AI nel 40% dei casi.', score: 5, is_objection: false },
				{ text: 'L\'AI può fornire spiegazioni delle sue decisioni con tecniche XAI.', score: 4, is_objection: true }
			];

			for (const arg of level3ControArgs) {
				await directus.request(
					createItem('arguments', {
						debate: debate.id,
						parent: level2ObjControl[0].id,
						argument: arg.text,
						is_objection: arg.is_objection,
						vote_score: arg.score,
						status: 'published'
					})
				);
			}
			console.log(`  ✅ Added ${level3ControArgs.length} level 3 arguments`);
		}

		console.log('\n✅ Complete test data created successfully!');
		console.log(`\nSummary:`);
		console.log(`- ${proArgs.length} Pro arguments (level 1)`);
		console.log(`- ${controArgs.length} Contro arguments (level 1)`);
		console.log(`- Multiple level 2 arguments with 5+ children for pagination testing`);
		console.log(`- Level 3 and 4 arguments for deep nesting testing`);
		console.log(`- Total: 4 levels of argument depth`);

	} catch (error) {
		console.error('❌ Error:', error);
		throw error;
	}
}

seedCompleteData();
