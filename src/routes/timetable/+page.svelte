<script lang="ts">
	// 课程表：样式按旧博客（Firefly）原版恢复——课程按名字配 8 种颜色，
	// 彩色边条卡片、图例、实时时钟、今天一列高亮；手机上按天列卡片。
	// 单双周轮换：「本周」按开学日自动算，「单周 / 双周」可以手动切过去看那一张表。
	import { onMount } from 'svelte';
	import { courses, periods, semester, type Course, type WeekRule } from '#lib/timetable';
	import { siteConfig } from '#config';
	import Built from '#lib/components/Built.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

	// 8 色循环（原版调色板）：h 色相、s 饱和度，明度在 CSS 里按深浅主题给
	const PAL = [
		{ h: 210, s: 80 },
		{ h: 160, s: 70 },
		{ h: 280, s: 60 },
		{ h: 25, s: 85 },
		{ h: 340, s: 70 },
		{ h: 190, s: 75 },
		{ h: 45, s: 80 },
		{ h: 120, s: 45 }
	];
	const PALETTE = PAL.length;

	/** 展开周次规则为具体周次数组（含单双周过滤） */
	function expandWeeks(rules: WeekRule[], total: number): number[] {
		const out: number[] = [];
		for (const r of rules) {
			for (let w = r.start; w <= Math.min(r.end, total); w++) {
				if (r.parity === 'odd' && w % 2 === 0) continue;
				if (r.parity === 'even' && w % 2 === 1) continue;
				if (!out.includes(w)) out.push(w);
			}
		}
		return out.sort((a, b) => a - b);
	}

	/** 周次文案，原版写法：1-18周、1-18周单、1-18周双 */
	function weeksLabel(rules: WeekRule[]): string {
		return rules
			.map((r) => {
				const p = r.parity === 'odd' ? '单' : r.parity === 'even' ? '双' : '';
				return r.start === r.end ? `${r.start}周${p}` : `${r.start}-${r.end}周${p}`;
			})
			.join('，');
	}

	// 课程名 → 颜色下标（8 色循环，同名的课同色）
	const colorMap = new Map<string, number>();
	const colorOf = (name: string) => {
		if (!colorMap.has(name)) colorMap.set(name, colorMap.size % PALETTE);
		return colorMap.get(name) as number;
	};

	interface Cell {
		course: Course;
		slot: number;
		color: number;
		weeks: number[];
		weeksText: string;
	}
	/** grid[day][slot] = 该时段的课（单双周交替的时段会有两门） */
	const grid: Record<number, Record<number, Cell[]>> = {};
	for (const c of courses) {
		grid[c.day] ??= {};
		grid[c.day][c.slot] ??= [];
		grid[c.day][c.slot].push({
			course: c,
			slot: c.slot,
			color: colorOf(c.name),
			weeks: expandWeeks(c.weeks, semester.totalWeeks),
			weeksText: weeksLabel(c.weeks)
		});
	}
	const legend = [...colorMap.entries()].map(([name, i]) => ({ name, i }));

	const hasWeekend = courses.some((c) => c.day > 5);
	const shownDays = hasWeekend ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5];

	// ---- 周次与视图状态 ----
	type Mode = 'auto' | 'odd' | 'even';
	let mode = $state<Mode>('auto');
	let week = $state<number | null>(null); // 自动算出的当前周，没开学/已结课为 null
	let todayDay = $state<number | null>(null);
	let now = $state(new Date());

	onMount(() => {
		const start = new Date(`${semester.startDate}T00:00:00`);
		const tick = () => {
			now = new Date();
			const raw = Math.floor((now.getTime() - start.getTime()) / (7 * 86400000)) + 1;
			week = raw >= 1 && raw <= semester.totalWeeks ? raw : null;
			todayDay = now.getDay() === 0 ? 7 : now.getDay();
		};
		tick();
		const timer = setInterval(tick, 1000);
		return () => clearInterval(timer);
	});

	/** 看的是哪一周：单周=第1周，双周=第2周，本周=自动 */
	const viewWeek = $derived(mode === 'odd' ? 1 : mode === 'even' ? 2 : week);
	/** 标日期用的周（自动模式下没开学/已结课就夹在 1..total） */
	const dateWeek = $derived(
		mode === 'odd' ? 1 : mode === 'even' ? 2 : (week ?? 1)
	);

	const inWeek = (cell: Cell) => viewWeek !== null && cell.weeks.includes(viewWeek);

	const todayCount = $derived(
		todayDay !== null
			? (grid[todayDay] ? Object.entries(grid[todayDay]) : []).reduce(
					(n, [, cells]) => n + (viewWeek !== null && cells.some(inWeek) ? 1 : 0),
					0
				)
			: 0
	);

	const pad = (n: number) => String(n).padStart(2, '0');
	const clockTime = $derived(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
	const clockWeekday = $derived(`星期${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]}`);
	const todayName = $derived(todayDay !== null ? `星期${WEEKDAYS[todayDay - 1]}` : '');

	/** 某一周的周一日期，再往后推 d-1 天，标在表头 */
	function dateOf(weekN: number, d: number): string {
		const m = new Date(`${semester.startDate}T00:00:00`);
		m.setDate(m.getDate() + (weekN - 1) * 7 + (d - 1));
		return `${m.getMonth() + 1}/${m.getDate()}`;
	}

	const parityText = $derived(
		mode === 'odd' ? '单周' : mode === 'even' ? '双周' : viewWeek === null ? '' : viewWeek % 2 === 1 ? '单周' : '双周'
	);
	const weekText = $derived(
		viewWeek === null
			? now < new Date(`${semester.startDate}T00:00:00`)
				? '未开学'
				: '已结课'
			: `第 ${viewWeek} 周${parityText ? ` · ${parityText}` : ''}`
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
			{semester.startDate} 起，共 {semester.totalWeeks} 周。现在的周次看右边一栏，也可以用「单周 / 双周」切过去看另一张表。
		</p>

		<!-- 课程图例 -->
		<ul class="legend">
			{#each legend as l (l.name)}
				<li>
					<span class="dot" style="--h:{PAL[l.i].h}; --s:{PAL[l.i].s}%"></span>
					{l.name}
				</li>
			{/each}
		</ul>

		<!-- 时钟 + 今日汇总 + 单双周切换 -->
		<div class="clock">
			<div class="clock-row">
				<span class="wd">{clockWeekday}</span>
				<span class="time ef-field">{clockTime}</span>
				<span class="switch" role="group" aria-label="查看哪一周">
					{#each [['auto', '本周'], ['odd', '单周'], ['even', '双周']] as [m, label] (m)}
						<button class="seg" class:active={mode === m} onclick={() => (mode = m as Mode)} aria-pressed={mode === m}>
							{label}
						</button>
					{/each}
				</span>
			</div>
			<p class="summary">
				{#if viewWeek === null}
					{now < new Date(`${semester.startDate}T00:00:00`) ? '假期中，还没开学。' : '本学期已结束。'}
				{:else if todayDay !== null && shownDays.includes(todayDay)}
					今天是{todayName}，{todayCount > 0 ? `要上 ${todayCount} 节。` : '今天没课。'}
				{:else}
					{weekText}。
				{/if}
			</p>
		</div>

		<!-- 桌面端：表格视图 -->
		<div class="scroller desk">
			<table class="tt">
				<thead>
					<tr>
						<th class="corner" scope="col">节次</th>
						{#each shownDays as d (d)}
							<th scope="col" class:today={d === todayDay && viewWeek !== null}>
								星期{WEEKDAYS[d - 1]}
								<span class="dday ef-field">{dateOf(dateWeek, d)}</span>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each periods as p, slot (p.label)}
						<tr>
							<td class="pcell">
								<span class="ppart">{p.part}</span>
								<span class="plabel">{p.label}</span>
								<span class="psessions">{p.sessions}</span>
								<span class="ptime ef-field">{p.start}</span>
								<span class="ptime ef-field">{p.end}</span>
							</td>
							{#each shownDays as d (d)}
								{@const cells = grid[d]?.[slot] ?? []}
								<td class:today={d === todayDay && viewWeek !== null}>
									<div class="stack">
										{#each cells as cell (cell.course.name + cell.weeksText)}
											<div
												class="course"
												class:off={viewWeek !== null && !inWeek(cell)}
												style="--h:{PAL[cell.color].h}; --s:{PAL[cell.color].s}%"
												title={cell.weeksText}
											>
												<span class="bar" aria-hidden="true"></span>
												<span class="ctext">
													<span class="cname">{cell.course.name}</span>
													<span class="cweeks">{cell.weeksText}</span>
													{#if cell.course.location}<span class="cmeta">{cell.course.location}</span>{/if}
													{#if cell.course.teacher}<span class="cmeta">{cell.course.teacher}{cell.course.className ? ` · ${cell.course.className}` : ''}</span>{/if}
												</span>
											</div>
										{/each}
									</div>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- 手机端：按天列表 -->
		<div class="days">
			{#each shownDays as d (d)}
				{@const dayCells = (grid[d] ? Object.entries(grid[d]) : [])
					.flatMap(([, cells]) => cells)
					.sort((a, b) => a.slot - b.slot)}
				{@const count = dayCells.filter(inWeek).length}
				<section class="day" class:today={d === todayDay && viewWeek !== null}>
					<header class="day-head">
						<span class="day-name">星期{WEEKDAYS[d - 1]}</span>
						<span class="ef-field">{dateOf(dateWeek, d)}</span>
						<span class="day-count ef-field">本周上 {count} 节</span>
					</header>
					{#if dayCells.length === 0}
						<p class="day-empty">这一天没有安排。</p>
					{:else}
						<div class="day-list">
							{#each dayCells as cell (cell.course.name + cell.course.day + cell.course.slot + cell.weeksText)}
								{@const p = periods[cell.course.slot]}
								<div class="slot-row">
									<span class="slot-meta ef-field">
										{p?.part} · {p?.label} · {p?.sessions} · {p?.start}–{p?.end}
									</span>
									<div
										class="course"
										class:off={viewWeek !== null && !inWeek(cell)}
										style="--h:{PAL[cell.color].h}; --s:{PAL[cell.color].s}%"
									>
										<span class="bar" aria-hidden="true"></span>
										<span class="ctext">
											<span class="cname">{cell.course.name}</span>
											<span class="cweeks">{cell.weeksText}</span>
											{#if cell.course.location}<span class="cmeta">{cell.course.location}</span>{/if}
											{#if cell.course.teacher}<span class="cmeta">{cell.course.teacher}{cell.course.className ? ` · ${cell.course.className}` : ''}</span>{/if}
										</span>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</section>
			{/each}
		</div>
	</section>

	<aside class="ef-margin">
		<h2 class="ef-pair"><span class="ef-eyebrow">Now</span><span>进度</span></h2>
		<ul class="ef-ledger">
			<li><span>学期</span><span class="ef-field">{semester.term}</span></li>
			<li><span>当前</span><span class="ef-field" data-current-week>{weekText}</span></li>
			<li><span>总周数</span><span class="ef-field">{semester.totalWeeks} 周</span></li>
			<li><span>课程数</span><span class="ef-field">{colorMap.size} 门</span></li>
		</ul>
		<h2 class="ef-pair mid"><span class="ef-eyebrow">How</span><span>说明</span></h2>
		<p class="rule">
			周次按开学日自动算，单周上单周的课，双周上双周的课；淡掉的课这周不上。要改课，去
			<code>src/lib/timetable.ts</code>。
		</p>
		<Built target={data.deployTarget} />
	</aside>
</div>

<style>
	/* ---- 图例 ---- */
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.25rem;
		margin: 1.5rem 0 0;
		padding: 0;
		list-style: none;
		color: var(--ef-ink-2);
		font-size: 0.8rem;
	}
	.legend li {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 999px;
		background: hsl(var(--h) var(--s) 50%);
	}

	/* ---- 时钟卡片 + 单双周切换 ---- */
	.clock {
		margin-top: 1.25rem;
		padding: 0.9rem 1rem;
		border: 1px solid var(--ef-rule);
		border-radius: 0.75rem;
	}
	.clock-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1rem;
	}
	.wd {
		font-weight: 600;
	}
	.time {
		color: var(--ef-ink-2);
	}
	.switch {
		display: inline-flex;
		gap: 0.35rem;
		margin-left: auto;
	}
	.seg {
		padding: 0.25rem 0.85rem;
		border: 1px solid var(--ef-rule);
		border-radius: 999px;
		background: transparent;
		color: var(--ef-ink-2);
		font: inherit;
		font-size: 0.8rem;
		cursor: pointer;
		transition: border-color 0.2s, color 0.2s, background-color 0.2s;
	}
	.seg:hover {
		border-color: var(--ef-ink);
		color: var(--ef-ink);
	}
	.seg.active {
		border-color: transparent;
		background: var(--ef-signal);
		color: var(--ef-on-signal);
		font-weight: 700;
	}
	.summary {
		margin: 0.5rem 0 0;
		color: var(--ef-ink-2);
		font-size: 0.875rem;
	}

	/* ---- 桌面表格（原版：border-separate + 圆角格 + 彩色课程卡） ---- */
	.desk {
		display: block;
	}
	.days {
		display: none;
	}
	@media (max-width: 959px) {
		.desk {
			display: none;
		}
		.days {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}
	}
	.scroller {
		overflow-x: auto;
		margin-top: 1.25rem;
		border: 1px solid var(--ef-rule);
		border-radius: 0.75rem;
		padding: 0.5rem;
	}
	.tt {
		width: 100%;
		min-width: 40rem;
		border-collapse: separate;
		border-spacing: 0.25rem;
		table-layout: fixed;
		text-align: left;
	}
	.tt th,
	.tt td {
		padding: 0.25rem;
		vertical-align: top;
	}
	.corner {
		width: 4.5rem;
		text-align: center;
		color: var(--ef-ink-2);
		font-size: 0.75rem;
		font-weight: 500;
	}
	thead th {
		text-align: center;
		color: var(--ef-ink-2);
		font-size: 0.75rem;
		font-weight: 500;
		border-radius: 0.375rem;
		padding: 0.5rem 0.25rem;
	}
	.dday {
		display: block;
		margin-top: 0.1rem;
		font-size: 0.65rem;
	}
	/* 今天的列：垫一层淡淡的底色（原版 is-today） */
	thead th.today,
	tbody td.today {
		background: color-mix(in srgb, var(--ef-signal) 18%, transparent);
	}

	.pcell {
		border-radius: 0.375rem;
		background: color-mix(in srgb, var(--ef-ink) 5%, transparent);
		text-align: center;
		padding: 0.5rem 0.25rem;
	}
	.ppart {
		display: block;
		color: var(--ef-ink-2);
		font-size: 0.7rem;
	}
	.plabel {
		display: block;
		font-size: 0.8125rem;
		font-weight: 600;
	}
	.psessions {
		display: block;
		color: var(--ef-ink-2);
		font-size: 0.7rem;
	}
	.ptime {
		display: block;
		font-size: 0.65rem;
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-height: 5.5rem;
	}

	/* 课程卡：彩色边条 + 同色课名（原版 course-card / course-bar） */
	.course {
		display: flex;
		gap: 0.5rem;
		overflow: hidden;
		border: 1px solid var(--ef-rule);
		border-radius: 0.375rem;
		background: color-mix(in srgb, var(--ef-panel) 55%, transparent);
		transition: opacity 0.3s;
	}
	.bar {
		width: 0.25rem;
		flex-shrink: 0;
		background: hsl(var(--h) var(--s) 50%);
	}
	.ctext {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.5rem 0.5rem 0.5rem 0;
		min-width: 0;
	}
	.cname {
		color: hsl(var(--h) var(--s) 42%);
		font-size: 0.75rem;
		font-weight: 600;
		line-height: 1.35;
	}
	.cweeks,
	.cmeta {
		color: var(--ef-ink-2);
		font-size: 0.7rem;
		line-height: 1.35;
	}
	/* 不是这一周的课：淡下去（原版 not-this-week） */
	.course.off {
		opacity: 0.35;
	}

	:global(:root[data-theme='dark']) .cname {
		color: hsl(var(--h) var(--s) 68%);
	}
	@media (prefers-color-scheme: dark) {
		:global(:root:not([data-theme])) .cname {
			color: hsl(var(--h) var(--s) 68%);
		}
	}

	/* ---- 手机端按天卡片 ---- */
	.day {
		border: 1px solid var(--ef-rule);
		border-radius: 0.75rem;
		overflow: hidden;
	}
	.day.today {
		border-color: var(--ef-trace);
		box-shadow: 0 0 0 1px var(--ef-trace);
	}
	.day-head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.65rem 1rem;
		border-bottom: 1px solid var(--ef-rule);
		background: color-mix(in srgb, var(--ef-ink) 4%, transparent);
	}
	.day-name {
		font-weight: 600;
	}
	.day-count {
		margin-left: auto;
	}
	.day-empty {
		margin: 0;
		padding: 1rem;
		color: var(--ef-ink-2);
		font-size: 0.875rem;
		text-align: center;
	}
	.day-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.75rem;
	}
	.slot-row {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.slot-meta {
		font-size: 0.72rem;
	}
	.day .course .cname {
		font-size: 0.875rem;
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
