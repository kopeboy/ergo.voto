import type { Claim } from './types';

export const mockDebateData: Claim[] = [
	{
		id: '1',
		debate_id: '1',
		content: 'Il cambiamento climatico è una delle sfide più urgenti del nostro tempo e richiede azione immediata.',
		type: 'pro',
		parent_id: null,
		votes: {
			accuracy: 42,
			relevance: 38
		},
		user_updated: 'mario_rossi',
		date_updated: '2024-01-15T10:30:00Z',
		status: 'published',
		children: [
			{
				id: '2',
				debate_id: '1',
				content: 'I dati scientifici mostrano un aumento costante delle temperature globali negli ultimi decenni.',
				type: 'pro',
				parent_id: '1',
				votes: {
					accuracy: 67,
					relevance: 45
				},
				user_updated: 'scienziato_verde',
				date_updated: '2024-01-15T11:00:00Z',
				status: 'published',
				children: [
					{
						id: '4',
						debate_id: '1',
						content: 'Le temperature sono sempre variate nel corso della storia della Terra, questo è un ciclo naturale.',
						type: 'contro',
						parent_id: '2',
						votes: {
							accuracy: 12,
							relevance: 8
						},
						user_updated: 'scettico_123',
						date_updated: '2024-01-15T12:00:00Z',
						status: 'published',
						children: []
					},
					{
						id: '5',
						debate_id: '1',
						content: 'La velocità del cambiamento attuale è senza precedenti e correlata alle attività umane.',
						type: 'pro',
						parent_id: '2',
						votes: {
							accuracy: 54,
							relevance: 48
						},
						user_updated: 'ricercatore_clima',
						date_updated: '2024-01-15T13:30:00Z',
						status: 'published',
						children: []
					}
				]
			},
			{
				id: '3',
				debate_id: '1',
				content: 'Le soluzioni proposte sono troppo costose e danneggerebbero l\'economia.',
				type: 'contro',
				parent_id: '1',
				votes: {
					accuracy: -15,
					relevance: 10
				},
				user_updated: 'economista_pratico',
				date_updated: '2024-01-15T11:30:00Z',
				status: 'published',
				children: [
					{
						id: '6',
						debate_id: '1',
						content: 'Gli investimenti in energia rinnovabile creano nuovi posti di lavoro e opportunità economiche.',
						type: 'pro',
						parent_id: '3',
						votes: {
							accuracy: 35,
							relevance: 29
						},
						user_updated: 'green_economy',
						date_updated: '2024-01-16T14:00:00Z',
						status: 'published',
						children: []
					}
				]
			}
		]
	},
	{
		id: '7',
		debate_id: '1',
		content: 'La tecnologia nucleare dovrebbe essere parte della soluzione per ridurre le emissioni di CO2.',
		type: 'pro',
		parent_id: null,
		votes: {
			accuracy: 28,
			relevance: 31
		},
		user_updated: 'ingegnere_nucleare',
		date_updated: '2024-01-16T09:00:00Z',
		status: 'published',
		children: [
			{
				id: '8',
				debate_id: '1',
				content: 'Il nucleare produce scorie radioattive pericolose per migliaia di anni.',
				type: 'contro',
				parent_id: '7',
				votes: {
					accuracy: 41,
					relevance: 38
				},
				user_updated: 'ambientalista_verde',
				date_updated: '2024-01-16T10:00:00Z',
				status: 'published',
				children: []
			}
		]
	}
];
