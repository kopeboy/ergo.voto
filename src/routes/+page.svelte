<div class="home-container">
	<header class="hero">
		<h1 class="hero-title">Ergo.voto</h1>
		<p class="hero-subtitle">Piattaforma per Dibattiti Strutturati</p>
		<p class="hero-description">
			Esplora argomentazioni gerarchiche con voto multi-dimensionale su Accuratezza e Rilevanza.
		</p>
	</header>

	<section class="debates-section">
		<h2 class="section-title">Dibattiti Attivi</h2>
		<div class="debate-card">
			<h3 class="debate-card-title">Cambiamento Climatico</h3>
			<p class="debate-card-description">
				Discussione strutturata sulle sfide climatiche e le possibili soluzioni.
			</p>
			<a href="/debate/1" class="debate-link">
				Partecipa al dibattito →
			</a>
		</div>
	</section>

	<section class="features-section">
		<h2 class="section-title">Caratteristiche</h2>
		<div class="features-grid">
			<div class="feature">
				<div class="feature-icon">🌳</div>
				<h3 class="feature-title">Struttura Gerarchica</h3>
				<p class="feature-description">Argomentazioni organizzate in alberi Pro/Contro</p>
			</div>
			<div class="feature">
				<div class="feature-icon">📊</div>
				<h3 class="feature-title">Voto Multi-Dimensionale</h3>
				<p class="feature-description">Valuta Accuratezza e Rilevanza</p>
			</div>
			<div class="feature">
				<div class="feature-icon">⚡</div>
				<h3 class="feature-title">Aggiornamenti Ottimistici</h3>
				<p class="feature-description">Feedback immediato sui tuoi voti</p>
			</div>
		</div>
	</section>
</div>

<style>
	.home-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.hero {
		text-align: center;
		padding: 3rem 1rem;
		margin-bottom: 3rem;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: 800;
		color: #111827;
		margin-bottom: 1rem;
		background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-subtitle {
		font-size: 1.5rem;
		color: #6b7280;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.hero-description {
		font-size: 1.125rem;
		color: #9ca3af;
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.debates-section {
		margin-bottom: 3rem;
	}

	.section-title {
		font-size: 1.875rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 1.5rem;
	}

	.debate-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.75rem;
		padding: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: all 0.3s;
	}

	.debate-card:hover {
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	.debate-card-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.75rem;
	}

	.debate-card-description {
		color: #6b7280;
		margin-bottom: 1.5rem;
		line-height: 1.6;
	}

	.debate-link {
		display: inline-block;
		background: #3b82f6;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		text-decoration: none;
		font-weight: 600;
		transition: background 0.2s;
	}

	.debate-link:hover {
		background: #2563eb;
	}

	.features-section {
		margin-bottom: 3rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
	}

	.feature {
		text-align: center;
		padding: 2rem;
		background: #f9fafb;
		border-radius: 0.75rem;
		border: 1px solid #e5e7eb;
	}

	.feature-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.feature-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 0.75rem;
	}

	.feature-description {
		color: #6b7280;
		line-height: 1.6;
	}

	@media (max-width: 768px) {
		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1.25rem;
		}

		.features-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
