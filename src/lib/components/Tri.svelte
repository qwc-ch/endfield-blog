<script lang="ts">
	// 三色条：页面最顶上和文章标题正下方，只放这两处。
	let { sweep = false } = $props();
</script>

<div class="ef-tri" class:ef-in-sweep={sweep} aria-hidden="true"><i></i><i></i><i></i></div>
