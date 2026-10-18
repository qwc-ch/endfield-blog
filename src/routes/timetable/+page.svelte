<script lang="ts">
	// 课程表：数据在 src/lib/timetable.ts 里改。周次、今天高亮在浏览器端算。
	import { onMount } from 'svelte';
	import { courses, periods, semester, type Course, type WeekRule } from '#lib/timetable';
	import { siteConfig } from '#config';
	import { formatNumber } from '#lib/posts';

	const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

	/** 展开周次规则为具体周次数组 */
	function expandWeeks(rules: WeekRule[], total: number): number[] {
		const out: number[] = [];
		for (const r of rules) {
			for (let w = r.start; w <= Math.min(r.end, total); w++) {
				const parity = r.parity ?? 'all';
				if (parity === 'odd' && w % 2 === 0) continue;
				if (parity === 'even' && w % 2 === 1) continue;
				out.push(w);
			}
		}
		return out;
	}

	interface Cell {
		course: Course;
		weeks: number[];
		weeksText: string;
	}
	/** grid[day][slot] = 该时段的所有课（可能有单双周两门） */
	const grid: Record<number, Record<number, Cell[]>> = {};
	for (const c of courses) {
		grid[c.day] ??= {};
		grid[c.day][c.slot] ??= [];
		grid[c.day][c.slot].push({
			course: c,
			weeks: expandWeeks(c.weeks, semester.totalWeeks),
			weeksText: c.weeks
				.map((r) => {
					const p = r.parity === 'odd' ? '（单）' : r.parity === 'even' ? '（双）' : '';
					return r.start === r.end ? `${r.start}周${p}` : `${r.start}-${r.end}周${p}`;
				})
				.join('，')
		});
	}
	const shownDays = Object.keys(grid).map(Number).sort((a, b) => a - b);
	const firstDay = Math.min(...shownDays);
	const lastDay = Math.max(...shownDays);
	const dayRange = Array.from({ length: lastDay - firstDay + 1 }, (_, i) => firstDay + i);
	/** 大节分组（早读 / 上午 / 中午 / 下午 / 晚上），行头合并展示 */
	const parts = [...new Set(periods.map((p) => p.part))];

	let week = $state<number | null>(null);
	let todayDay = $state<number | null>(null);

	onMount(() => {
		const start = new Date(`${semester.startDate}T00:00:00`);
		const now = new Date();
		const raw = Math.floor((now.getTime() - start.getTime()) / (7 * 86400000)) + 1;
		week = raw < 1 ? null : raw > semester.totalWeeks ? null : raw;
		todayDay = now.getDay() === 0 ? 7 : now.getDay();
	});

	const inWeek = (cell: Cell) => week !== null && cell.weeks.includes(week);
	const todayCount = $derived(
		todayDay !== null
			? (grid[todayDay] ? Object.entries(grid[todayDay]) : []).reduce(
					(n, [, cells]) => n + (week !== null && cells.some(inWeek) ? 1 : 0),
					0
				)
			: null
	);
	const weekText = $derived(
		week === null
			? new Date() < new Date(`${semester.startDate}T00:00:00`)
				? '未开学'
				: '已结课'
			: `第 ${week} 周`
	);
</script>

<svelte:head>
	<title>课程表 · {siteConfig.title}</title>
	<meta name="description" content="{semester.term} · {semester.startDate} 起，共 {semester.totalWeeks} 周。" />
</svelte:head>

<div class="ef-spread">
	<section class="ef-sheet">
		<p class="ef-eyebrow slash">Timetable</p>
		<header class="ef-sheet-head">
			<h1 class="ef-read">课程表</h1>
			<p class="ef-field">{semester.term}</p>
		</header>
		<p class="ef-lede ef-read" style="margin-top: 1.25rem">
			{semester.startDate} 起，共 {semester.totalWeeks} 周。
			{#if todayCount !== null}
				今天有 <strong class="hl">{todayCount}</strong> 节要上。
			{/if}
		</p>

		<div class="scroller">
			<table class="tt">
				<thead>
					<tr>
						<th class="corner" scope="col"><span class="ef-field">节</span></th>
						{#each dayRange as d (d)}
							<th scope="col" class:today={d === todayDay}>
								<span class="ef-field">{days[d - 1]}</span>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each periods as p, slot (p.label)}
						<tr class:now={todayDay !== null && week !== null && grid[todayDay]?.[slot]?.some(inWeek)}>
							<th scope="row">
								<span class="plabel">{p.label}</span>
								<span class="ptime ef-field">{p.start}–{p.end}</span>
							</th>
							{#each dayRange as d (d)}
								{@const cells = grid[d]?.[slot] ?? []}
								<td class:has={cells.length}>
									{#each cells as cell (cell.course.name + cell.weeksText)}
										{@const hit = inWeek(cell)}
										{@const others = cells.filter((c) => c !== cell)}
										<div
											class="course"
											class:off={cells.length > 1 && !hit}
											class:hit={hit}
											title={cell.weeksText}
										>
											<span class="cname">{cell.course.name}</span>
											{#if cell.course.location || cell.course.teacher}
												<span class="cmeta ef-field"
													>{[cell.course.location, cell.course.teacher].filter(Boolean).join(' · ')}</span
												>
											{/if}
											{#if others.length && cells.length > 1}
												<span class="calt ef-field">与{others.map((o) => o.course.name).join('/')}单双周交替</span>
											{/if}
										</div>
									{/each}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<aside class="ef-margin">
		<h2 class="ef-pair"><span class="ef-eyebrow">Now</span><span>进度</span></h2>
		<ul class="ef-ledger">
			<li><span>学期</span><span class="ef-field">{semester.term}</span></li>
			<li><span>当前</span><span class="ef-field" data-current-week>{weekText}</span></li>
			<li><span>总周数</span><span class="ef-field">{semester.totalWeeks} 周</span></li>
			<li><span>课程数</span><span class="ef-field">{courses.length} 节次</span></li>
		</ul>
		<h2 class="ef-pair mid"><span class="ef-eyebrow">How</span><span>说明</span></h2>
		<p class="rule">
			表里的周次按开学日算。单双周交替的时段两门课都列出来，淡掉的不是本周的。要改课，去
			<code>src/lib/timetable.ts</code>。
		</p>
	</aside>
</div>

<style>
	.scroller {
		overflow-x: auto;
		margin-top: 1.75rem;
		border: 1px solid var(--ef-rule);
	}
	.tt {
		width: 100%;
		min-width: 44rem;
		border-collapse: collapse;
		table-layout: fixed;
	}
	.tt th,
	.tt td {
		border: 1px solid var(--ef-rule);
		padding: 0.45rem 0.5rem;
		vertical-align: top;
	}
	.corner {
		width: 6.5rem;
	}
	thead th {
		text-align: left;
		padding: 0.55rem 0.5rem;
		background: var(--ef-paper);
	}
	thead th.today {
		box-shadow: inset 0 -3px 0 var(--ef-trace);
	}
	tbody th {
		text-align: left;
		font-weight: 400;
	}
	.plabel {
		display: block;
		font-weight: 700;
		font-size: 0.875rem;
	}
	.ptime {
		display: block;
		margin-top: 0.15rem;
	}
	td {
		min-height: 3rem;
	}
	td.has {
		background: color-mix(in srgb, var(--ef-ink) 3%, transparent);
	}
	.course {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.course + .course {
		margin-top: 0.45rem;
		padding-top: 0.45rem;
		border-top: 1px dashed var(--ef-rule);
	}
	.cname {
		font-weight: 700;
		font-size: 0.875rem;
		line-height: 1.3;
	}
	.course.off .cname {
		color: var(--ef-ink-3);
		font-weight: 400;
	}
	.calt {
		display: none;
	}
	tr.now {
		box-shadow: inset 3px 0 0 var(--ef-trace);
	}
	.hl {
		font-weight: 700;
	}
	.ef-margin :global(.mid) {
		margin-top: 2.5rem;
	}
	.rule {
		max-width: 18rem;
		line-height: 1.75;
		color: var(--ef-ink-2);
	}
	.rule code {
		font-size: 0.8em;
	}
</style>
