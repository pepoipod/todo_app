(function () {

	/* データ構造 */

	/*

	//tasks

	var tasks = [
		{
			id: 0,
			category_id: 0,
			is_done: true,
			is_fav: false,
			title: "title_0",
			dead_line: {
				year: 2018,
				month: 8,
				day: 15,
				hour: 8,
				min: 00
			},
			body: "これはテストです",
			check_list: [
				false,
				true,
				false
			]
		}
	];

	//categories

	var categories = [
		{
			id: 0,
			name: "category_0",
			tasks: [
				0,
				1,
				2,
				3
			]
		}
	];

	*/


	/* storage-variables */


	var tasks = null;
	var categories = null;

	//今まで登録されたタスク、カテゴリーの中で最も大きいidを保持しておく
	var max_task_id = null;
	var max_category_id = null;

	var TASKS_KEY = 'tasks';
	var CATEGORIES_KEY = 'categories';
	var MAX_TASK_ID_KEY = 'max-task-id';
	var MAX_CATEGORY_ID_KEY = 'max-category-id';

	//tasksとcategoiesをストレージからを取得
	if (window.localStorage) {
		if (window.localStorage.getItem(TASKS_KEY)) {
			tasks = JSON.parse(window.localStorage.getItem(TASKS_KEY));
		} else {
			tasks = [];
		}

		if (window.localStorage.getItem(CATEGORIES_KEY)) {
			categories = JSON.parse(window.localStorage.getItem(CATEGORIES_KEY));
		} else {
			categories = [];
		}

		if (window.localStorage.getItem(MAX_TASK_ID_KEY)) {
			max_task_id = Number(window.localStorage.getItem(MAX_TASK_ID_KEY));
		} else {
			//最大値を保存してほしく、かつ0始まりにしたいため初期値は-1
			max_task_id = -1;
		}

		if (window.localStorage.getItem(MAX_CATEGORY_ID_KEY)) {
			max_category_id = Number(window.localStorage.getItem(MAX_CATEGORY_ID_KEY));
		} else {
			max_category_id = -1;
		}
	}

	console.log(tasks);


	/* data-reset */


	//window.localStorage.clear();
	//window.localStorage.removeItem(TASKS_KEY);
	//window.localStorage.removeItem(MAX_TASK_ID_KEY);
	//window.localStorage.removeItem(CATEGORIES_KEY);
	//window.localStorage.removeItem(MAX_CATEGORY_ID_KEY);


	/* global-variables */


	var body_dom = null;
	var container_dom = null;
	var category_list_dom = null;

	//完了済みタスクの表示、非表示を担うモジュールを格納
	var done_tasks_visible = null;
	//サイドメニューで表示中のタスクidを格納するための変数
	var opening_task_id = null;
	//選択中のカテゴリーのid（もしくはall等の文字列）を保持するための変数
	var selecting_category_id = null;


	/* taskのgetter郡 */


	var getAllTaskIds = function () {
		var task_ids = [];

		for (var i = 0, len = tasks.length; i < len; i++) {
			task_ids.push(tasks[i].id);
		}
		return task_ids;
	};

	var getFavoriteTaskIds = function () {
		var task_ids = [];

		for (var i = 0, len = tasks.length; i < len; i++) {
			if (tasks[i].is_fav) {
				task_ids.push(tasks[i].id);
			}
		}
		return task_ids;
	};

	var getTodayTaskIds = function () {
		var task_ids = [];
		var now = new Date();

		for (var i = 0, len = tasks.length; i < len; i++) {
			//年月日が一致しているもの
			if (tasks[i].dead_line.year === now.getFullYear() && tasks[i].dead_line.month - 1 === now.getMonth() &&
				tasks[i].dead_line.day === now.getDate()) {
				task_ids.push(tasks[i].id);
			}
		}
		return task_ids;
	};

	var getThisWeekIds = function () {
		var task_ids = [];
		var now = new Date();

		for (var i = 0, len = tasks.length; i < len; i++) {
			var task_deadline = new Date(
								tasks[i].dead_line.year,
								tasks[i].dead_line.month - 1,
								tasks[i].dead_line.day
							);

			var diff_date = Math.ceil((task_deadline - now) / (60 * 60 * 24 * 1000));
			//タスクの終了日が今日から一週間以内だった場合
			if(diff_date >= 0 && diff_date < 7) {
				task_ids.push(tasks[i].id);
			}
		}
		return task_ids;
	};

	var getTaskObjectById = function (_target_id) {
		//不正な値を弾くため
		if (!isInt(_target_id)) return false;

		for (var i = 0, len = tasks.length; i < len; i++) {
			if (tasks[i].id === Number(_target_id)) {
				return tasks[i];
			}
		}
		return false;
	};


	/* categoryのgetter郡 */


	var getCategoryObjectById = function (_target_id) {
		//allなどを除外するため
		if (!isInt(_target_id)) return false;

		for (var i = 0, len = categories.length; i < len; i++) {
			if (categories[i].id === Number(_target_id)) {
				return categories[i];
			}
		}
		return false;
	};

	var getCategoryObjectByName = function (_target_name) {
		for (var i = 0, len = categories.length; i < len; i++) {
			if (categories[i].name === _target_name) {
				return categories[i];
			}
		}
		return false;
	};

	//allやfavなどのidでないoptionデータを弾くための関数
	var getExistCategoryName = function () {
		switch (selecting_category_id) {
			case 'all':
			case 'today':
			case 'this_week':
				break;
			default:
				var category = getCategoryObjectById(selecting_category_id);

				if (category) {
					return category.name
				}
				break;
		}
		return '';
	};


	/* save-storage関連 */


	var saveTasksToStorage = function () {
		if (window.localStorage) {
			window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
		}
	};

	var saveCategoriesToStorage = function () {
		if (window.localStorage) {
			window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
		}
	};

	var saveMaxTaskIdToStorage = function () {
		if (window.localStorage) {
			window.localStorage.setItem(MAX_TASK_ID_KEY, String(max_task_id));
		}
	};

	var saveMaxCategoryIdToStorage = function () {
		if (window.localStorage) {
			window.localStorage.setItem(MAX_CATEGORY_ID_KEY, String(max_category_id));
		}
	};


	/* remove関連 */


	var removeTask = function (_target_id) {
		return function () {
			var res = confirm('タスクを削除しますか？');

			if (res) {
				for (var i = 0, len = tasks.length; i < len; i++) {
					if (tasks[i].id === _target_id) {
						//自分を含むcategoryのtasksから自分のidを削除する
						removeCategoriesTasksId(_target_id);

						tasks.splice(i, 1);

						saveTasksToStorage();

						alert('削除しました');

						renderTasks(selecting_category_id, done_tasks_visible.is_visible());
						closeSideMenu();

						return true;
					}
				}
				alert('削除に失敗しました');

				return false;
			} else {
				return false;
			}
		}
	};

	var removeCategory = function (_target_id) {
		return function () {
			var res = confirm('カテゴリーを削除しますか？');

			if (res) {
				for (var i = 0, len = categories.length; i < len; i++) {
					if (categories[i].id === Number(_target_id)) {
						//自分が持っているtaskを全て削除する
						removeCategoriesTasks(_target_id);

						categories.splice(i, 1);
						saveCategoriesToStorage();

						alert('削除しました');

						renderCategories();
						renderTasks('all', done_tasks_visible.is_visible());

						return true;
					}
				}
				return false;
			}
			return false;
		}
	};

	var removeCategoriesTasks = function (_category_id) {
		var category = getCategoryObjectById(_category_id);

		for (var ci = 0, clen = category.tasks.length; ci < clen; ci++) {
			for (var ti = 0, tlen = tasks.length; ti < tlen; ti++) {
				if (category.tasks[ci] === tasks[ti].id) {
					tasks.splice(ti, 1);
					break;
				}
			}
		}
		saveTasksToStorage();
	};

	var removeCategoriesTasksId = function (_target_id) {
		var task = getTaskObjectById(_target_id);
		var category = getCategoryObjectById(task.category_id);

		for (var i = 0, len = category.tasks.length; i < len; i++) {
			if (category.tasks[i] === _target_id) {
				category.tasks.splice(i, 1);

				saveCategoriesToStorage();

				return true;
			}
		}
		return false;
	};


	/* search関連 */


	var searchCategoriesTask = function (_category_id, _task_id) {
		var category = getCategoryObjectById(_category_id);

		for (var i = 0, len = category.tasks.length; i < len; i++) {
			if (category.tasks[i] === _task_id) {
				return i;
			}
		}
		return false;
	}


	/* utility郡 */

	var isInt = function (_target) {
		if (String(_target).match(/\d+/)) {
			return true;
		} else {
			return false;
		}
	}

	//taskの完了日時が現在時刻より前かどうか調べる
	var isElapsed = function (_task_id) {
		var task = getTaskObjectById(_task_id);
		var now = new Date();

		var task_deadline = new Date(
								task.dead_line.year,
								task.dead_line.month - 1,
								task.dead_line.day,
								task.dead_line.hour,
								task.dead_line.min
							);

		if (now > task_deadline) {
			return true;
		} else {
			return false;
		}
	};


	//minutesが1や2などの時に、先頭に0をつけた文字列として返す関数
	var changeMinutesNotation = function (_minutes) {
		if (String(_minutes).length === 1) {
			return '0' + String(_minutes);
		}
		return String(_minutes);
	}

	//task_idの配列が渡された時、すでに終了しているtaskを除外する
	var removeDoneTasksIdForArray = function (_task_ids) {
		var not_done_task_ids = [];

		for (var i = 0, len = _task_ids.length; i < len; i++) {
			var task = getTaskObjectById(_task_ids[i]);

			if (!task.is_done) {
				not_done_task_ids.push(task.id);
			}
		}
		return not_done_task_ids;
	}

	//textをhtmlタグを含む文字列に変換する
	var convertTextToHTML = function (_text, _task) {
		//innerHTMLでHTML要素にconvertさせるため、<p>始まりにさせる
		var converted_html = '<p>';
		var lines = [];

		//文中にhtmlタグの記法が含まれている場合、それらを全て削除
		_text = _text.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');

		//改行文字を\nに統一する
		_text = _text.replace(/\r\n/g, '\n');
    	_text = _text.replace(/\r/g, '\n');

    	lines = _text.split('\n');

    	if (_task.check_list.length !== 0) {
    		_task.check_list = [];
    	}

    	for (var i = 0, len = lines.length; i < len; i++) {
    		//チェックボックスを使う記法があれば、チェックボックスに変換。
    		if (lines[i].match(/-\[\] /)) {
				lines[i] = lines[i].replace(/-\[\] /, '<a class="check-box" href="javascript:void(0)"><i class="fa fa-square-o"></i></a> ');

				_task.check_list.push(false);
    		}
    		converted_html += lines[i];
    		//最後の行に<br/>は不要なため
    		if(i !== len -1) converted_html += '<br/>';
    	}
    	converted_html += '</p>';

    	return converted_html;
	};

	//htmlタグを含む文字列をtextに変換する
	var convertHTMLToText = function (_html) {
		_html = _html.replace(/<a class="check-box" href="javascript\:void\(0\)"><i class="fa fa-square-o"><\/i><\/a> /g, '-[] ');
		_html = _html.replace(/<br\/>/g, '\n');
		_html = _html.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');

		return _html;
	};

	//サイドメニューがすでに開かれているかをチェックし、もし開かれていればサイドメニューを更新する
	var checkOpenSideMenuAndUpdate = function (_task_id) {
		if (document.getElementById('side-menu').classList.contains('open')) {
			renderSideMenu(_task_id);
		}
	};


	/* value-toggle関連 */


	var toggleIsDone = function (_task_id) {
		return function (e) {
			e.stopPropagation();
			var task = getTaskObjectById(_task_id);

			task.is_done = !task.is_done;
			saveTasksToStorage();

			renderTasks(selecting_category_id, done_tasks_visible.is_visible());
			checkOpenSideMenuAndUpdate(_task_id);
		}
	};

	var toggleIsFav = function (_task_id) {
		return function (e) {
			e.stopPropagation();
			var task = getTaskObjectById(_task_id);

			task.is_fav = !task.is_fav;
			saveTasksToStorage();

			renderTasks(selecting_category_id, done_tasks_visible.is_visible());
			checkOpenSideMenuAndUpdate(_task_id);
		}
	};

	var toggleCheckListsValue = function (_checklist_index, _task) {
		return function () {
			_task.check_list[_checklist_index] = !_task.check_list[_checklist_index];
			saveTasksToStorage();

			renderSideMenu(_task.id);
			renderTasks(selecting_category_id, done_tasks_visible.is_visible());
		}
	};

	var toggleIsDoneVisible = function () {
		var is_visible = false;

		return {
			init: function () {
				is_visible = false;

				document.getElementsByClassName('display-done-tasks-btn')[0].value = '完了済みタスクを表示';
			},

			is_visible: function () {
				return is_visible;
			},

			toggle: function (_evt) {
				is_visible = !is_visible;

				if (is_visible) {
					_evt.target.value = '完了済みタスクを非表示';
				} else {
					_evt.target.value = '完了済みタスクを表示';
				}

				renderTasks(selecting_category_id, is_visible);
			}
		};
	};


	/* progress-bar関連 */


	var getProgressPercentage = function (_task) {
		var true_num = 0;

		for (var i = 0, len = _task.check_list.length; i < len; i++) {
			if (_task.check_list[i]) {
				true_num++;
			}
		}
		//(チェックボックスの総数 / チェックされた数)を達成率とし、それをNumberで返す
		return true_num !== 0 ? Math.round(100 / Math.round(_task.check_list.length / true_num)) : 0;
	}

	var createProgressBarElement = function (_task) {
			var comp_percentage = getProgressPercentage(_task);

			var achievement_dom = document.createElement('p');
			var achievement_progress_dom = document.createElement('progress');
			var progress_span_dom = document.createElement('span');

			achievement_dom.classList.add('achievement-rate');
			achievement_progress_dom.max = 100;
			achievement_progress_dom.value = comp_percentage;

			progress_span_dom.innerHTML = comp_percentage;
			achievement_progress_dom.appendChild(progress_span_dom);
			achievement_progress_dom.innerHTML += '%';

			achievement_dom.appendChild(achievement_progress_dom);
			achievement_dom.innerHTML += `${comp_percentage}%`;

			return achievement_dom;
	};


	/* 期限を基にしたtask idの挿入ソート */


	var insert = function (_x, _tasks) {
	 	if(_tasks.length <= 0) {
			return [_x];
		}

		var y = _tasks.shift();

		var x_task = getTaskObjectById(_x);
		var y_task = getTaskObjectById(y);

		var x_task_deadline = new Date(
								x_task.dead_line.year,
								x_task.dead_line.month - 1,
								x_task.dead_line.day,
								x_task.dead_line.hour,
								x_task.dead_line.min
							);

		var y_task_deadline = new Date(
								y_task.dead_line.year,
								y_task.dead_line.month - 1,
								y_task.dead_line.day,
								y_task.dead_line.hour,
								y_task.dead_line.min
							);


		if (x_task_deadline < y_task_deadline) {
			return [_x].concat([y].concat(_tasks));
		} else {
			return [y].concat(insert(_x, _tasks));
		}
	};

	var sortTaskFromDeadline = function (_tasks) {
		if (_tasks.length <= 0) return _tasks;

		var x = _tasks.shift();

		return insert(x, sortTaskFromDeadline(_tasks));
	};


	/* render-task関連 */


	var renderTasks = function (_category_id, _is_done_visible) {
		var task_container_dom = document.getElementsByClassName('task-container')[0];

		//init
		task_container_dom.innerHTML = '';

		//idを基に、何をレンダリングするかを定めるswitch
		switch (_category_id) {
			case 'all':
				var tmp_categories_tasks = getAllTaskIds();
				break;
			case 'fav':
				var tmp_categories_tasks = getFavoriteTaskIds();
				break;
			case 'today':
				var tmp_categories_tasks = getTodayTaskIds();
				break;
			case 'this_week':
				var tmp_categories_tasks = getThisWeekIds();
				break;
			default:
				//大元のcategoryのtasksがshiftされないようにするため新しい配列に中身を移す
				var tmp_categories_tasks = [].concat(getCategoryObjectById(_category_id).tasks);
				break;
		}

		//完了済みタスクを非表示の時はarrayから完了済みのtaskを取り除く
		if (!_is_done_visible) {
			tmp_categories_tasks = removeDoneTasksIdForArray(tmp_categories_tasks);
		}

		//categoryが持っているtaskのidを日付順に並べ、配列として取得する
		var sorted_task_ids = sortTaskFromDeadline(tmp_categories_tasks);

		var tasks_inner_doms = createAllTasksElements(sorted_task_ids);

		var tmp_dom = document.createDocumentFragment();

		for (var i = 0, len = tasks_inner_doms.length; i < len; i++) {
			tmp_dom.appendChild(tasks_inner_doms[i]);
		};
		task_container_dom.appendChild(tmp_dom);

		//数字であればNumberで、そうでなければそのまま(String)の値をselecting_category_idにセットする
		selecting_category_id = isInt(_category_id) ? Number(_category_id) : _category_id;
	};

	var createAllTasksElements = function (_sorted_task_ids) {
		var li_container = [];
		//日毎のタスク
		var date_tasks = [];
		//年毎のタスク
		var year_tasks = [];

		for (var i = 0, len = _sorted_task_ids.length; i < len; i++) {
			var prev_task = getTaskObjectById(_sorted_task_ids[i - 1]);
			var task = getTaskObjectById(_sorted_task_ids[i]);

			var li_dom = document.createElement('li');
			li_dom = createTaskElement(task);

			//初回でない場合
			if (i !== 0) {
				//一つ前のtask.dead_lineのyear, month, dayが今のものが違っていた場合、li_containerの中身をdate_tasksとしてひとまとめにする
				if (task.dead_line.day !== prev_task.dead_line.day || task.dead_line.month !== prev_task.dead_line.month ||
					task.dead_line.year !== prev_task.dead_line.year) {
					date_tasks.push(createDateTasksElements(li_container, prev_task.dead_line));
					li_container = [];
				}

				//一つ前のtaskのdead_line.yearと今のものが違っていた場合、date_tasksの中身をyear_tasksとしてひとまとめにする
				if (task.dead_line.year !== prev_task.dead_line.year) {
					year_tasks.push(createYearTasksElements(date_tasks, prev_task.dead_line.year));
					date_tasks = [];
				}

			}

			//最後だった場合、残りのtaskをDOMに変換してループを抜ける
			if (i === len - 1) {
				li_container.push(li_dom);
				date_tasks.push(createDateTasksElements(li_container, task.dead_line));
				year_tasks.push(createYearTasksElements(date_tasks, task.dead_line.year));

				break;
			}

			//最後にpushすることで前のtaskと比較したものをdate_taskやyear_taskに正しく分類出来る
			li_container.push(li_dom);
		}

		return year_tasks;
	};

	var createTaskElement = function (_task) {
		var li_dom = document.createElement('li');
		var wrapper_dom = document.createElement('div');

		var left_dom = document.createElement('div');
		var checkbox_dom = document.createElement('a');
		var checkbox_icon_dom = document.createElement('i');
		var view_task_dom = document.createElement('a');
		var title_dom = document.createElement('p');

		var right_dom = document.createElement('div');
		var deadline_dom = document.createElement('time');
		var deadline_icon_dom = document.createElement('i');
		var fav_dom = document.createElement('a');
		var fav_icon_dom = document.createElement('i');

		//完了日時を過ぎている、完了していないタスクを赤字にする
		if (isElapsed(_task.id) && !_task.is_done) {
			li_dom.classList.add('elapsed');
		}

		li_dom.addEventListener('click', openSideMenu(_task.id), false);
		wrapper_dom.classList.add('wrapper', 'clearfix');

		//left
		left_dom.classList.add('left');

		checkbox_dom.classList.add('check-box');
		checkbox_dom.href = 'javascript:void(0)';
		checkbox_dom.addEventListener('click', toggleIsDone(_task.id), false);

		if (_task.is_done) {
			checkbox_icon_dom.classList.add('fa', 'fa-check-square-o');
			li_dom.classList.add('done');
		} else {
			checkbox_icon_dom.classList.add('fa', 'fa-square-o');
		}

		view_task_dom.classList.add('view-task');
		view_task_dom.href = '#side-menu';
		view_task_dom.addEventListener('click', openSideMenu(_task.id), false);

		title_dom.classList.add('title');

		//right
		right_dom.classList.add('right');

		deadline_dom.classList.add('dead-line');
		deadline_icon_dom.classList.add('fa', 'fa-clock-o');

		fav_dom.classList.add('fav');
		fav_dom.href = 'javascript:void(0)';
		fav_dom.addEventListener('click', toggleIsFav(_task.id), false);

		if (_task.is_fav) {
			fav_icon_dom.classList.add('fa', 'fa-star');
		} else {
			fav_icon_dom.classList.add('fa', 'fa-star-o');
		}

		//left
		checkbox_dom.appendChild(checkbox_icon_dom);

		title_dom.innerHTML = _task.title;
		view_task_dom.appendChild(title_dom);

		left_dom.appendChild(checkbox_dom);
		left_dom.appendChild(view_task_dom);

		//right
		deadline_dom.appendChild(deadline_icon_dom);
		deadline_dom.innerHTML += ` ${_task.dead_line.hour}:${changeMinutesNotation(_task.dead_line.min)}`;

		fav_dom.appendChild(fav_icon_dom);

		right_dom.appendChild(deadline_dom);
		right_dom.appendChild(fav_dom);

		//checkboxを持っていた際、progressバーを追加
		if (_task.check_list.length !== 0) {
			right_dom.appendChild(createProgressBarElement(_task));
		}

		//all
		wrapper_dom.appendChild(left_dom);
		wrapper_dom.appendChild(right_dom);

		li_dom.appendChild(wrapper_dom);

		return li_dom;
	};

	//完了する日・月が同じtaskをまとまったDOMとして生成、返すfunction
	var createDateTasksElements = function (_li_container, _dead_line) {
		var tasks_dom = document.createElement('div');

		var date_dom = document.createElement('time');
		var ul_dom = document.createElement('ul');

		tasks_dom.classList.add('tasks');
		date_dom.classList.add('date');

		date_dom.innerHTML = `${_dead_line.month}/${_dead_line.day}`;
		tasks_dom.appendChild(date_dom);

		for (var i = 0, len = _li_container.length; i < len; i++) {
			ul_dom.appendChild(_li_container[i]);
		}
		tasks_dom.appendChild(ul_dom);

		return tasks_dom;
	};

	//完了する年が同じtaskをまとまったDOMとして生成、返すfunction
	var createYearTasksElements = function (_date_tasks, _dead_line_year) {
		var year_tasks_dom = document.createElement('div');

		var date_wrapper_dom = document.createElement('p');
		var date_dom = document.createElement('time');

		year_tasks_dom.classList.add('year-tasks');
		date_wrapper_dom.classList.add('year');

		date_dom.innerHTML = _dead_line_year;

		date_wrapper_dom.appendChild(date_dom);
		year_tasks_dom.appendChild(date_wrapper_dom);

		for (var i = 0, len = _date_tasks.length; i < len; i++) {
			year_tasks_dom.appendChild(_date_tasks[i]);
		}

		return year_tasks_dom;
	};


	/* render-category関連 */

	//初期に設定されている[お気に入り, 今日, 今週, +]以外のlistを削除する
	var initCategories = function () {
		while (category_list_dom.children.length > 4) {
			category_list_dom.removeChild(category_list_dom.children[3]);
		}
	};

	var renderCategories = function () {
		initCategories();

		var tmp_dom = document.createDocumentFragment();

		for (var i = 0, len = categories.length; i < len; i++) {
			var li_dom = document.createElement('li');
			var a_dom = document.createElement('a');
			var input_dom = document.createElement('input');

			input_dom.type = 'hidden';
			input_dom.value = categories[i].id;

			a_dom.appendChild(input_dom);

			a_dom.href = 'javascript:void(0)';
			a_dom.innerHTML += categories[i].name;

			li_dom.appendChild(a_dom);
			tmp_dom.appendChild(li_dom);
		};
		//+ボタンの前に挿入する
		category_list_dom.insertBefore(tmp_dom, category_list_dom.getElementsByClassName('add-category-btn')[0]);
	};

	var onClickCategory = function (_evt) {
		//iタグのedit、trashボタンで動作しないように
		if (_evt && _evt.target.tagName === 'A') {
			var category_id = _evt.target.getElementsByTagName('input')[0].value;
			//valueに''が設定されているadd-category-btnを除外するため
			if (category_id === '') return false;

			highlightSelectedCategory(_evt);
			addEditButtonToCategory(_evt);
			done_tasks_visible.init();

			renderTasks(category_id, false);
		}
	};

	var highlightSelectedCategory = function (_evt) {
		if (document.getElementsByClassName('selected').length !== 0) {
			document.getElementsByClassName('selected')[0].classList.remove('selected');
		}

		_evt.target.parentNode.classList.add('selected');
	};

	//選択中のカテゴリーにedit、trashボタンを追加する
	var addEditButtonToCategory = function (_evt) {
		var prev_util_dom = category_list_dom.getElementsByClassName('util')[0];

		if (prev_util_dom) {
			prev_util_dom.parentNode.removeChild(prev_util_dom);
		}

		if (!getCategoryObjectById(_evt.target.getElementsByTagName('input')[0].value)) {
			return false;
		}

		var category_id = _evt.target.parentNode.getElementsByTagName('input')[0].value;

		var util_dom = document.createElement('div');

		var edit_p_dom = document.createElement('p');
		var edit_a_dom = document.createElement('a');
		var edit_i_dom = document.createElement('i');

		var trash_p_dom = document.createElement('p');
		var trash_a_dom = document.createElement('a');
		var trash_i_dom = document.createElement('i');

		util_dom.classList.add('util');

		edit_p_dom.classList.add('edit');
		trash_p_dom.classList.add('trash');

		edit_a_dom.href = 'javascript:void(0)';
		trash_a_dom.href = 'javascript:void(0)';

		edit_i_dom.classList.add('fa', 'fa-pencil-square-o');
		trash_i_dom.classList.add('fa', 'fa-trash-o');

		edit_i_dom.addEventListener('click', openModalWindow('new-category', true, category_id), false);
		trash_i_dom.addEventListener('click', removeCategory(category_id), false);

		edit_a_dom.appendChild(edit_i_dom);
		edit_p_dom.appendChild(edit_a_dom);

		trash_a_dom.appendChild(trash_i_dom);
		trash_p_dom.appendChild(trash_a_dom);

		util_dom.appendChild(edit_p_dom);
		util_dom.appendChild(trash_p_dom);

		_evt.target.parentNode.insertBefore(util_dom, _evt.target);
	};


	/* new-task関連 */


	var createNewTask = function () {
		var modal_dom = document.getElementById('modal-window');
		var selections_dom = modal_dom.getElementsByClassName('selections')[0];

		var task = {};
		var category = {};

		task.id = max_task_id + 1;
		task.is_done = false;
		task.is_fav = false;
		task.title = modal_dom.getElementsByClassName('i-title')[0].value;

		task.dead_line = {};

		task.dead_line.year = Number(selections_dom.getElementsByClassName('s-year')[0].value);
		task.dead_line.month = Number(selections_dom.getElementsByClassName('s-month')[0].value);
		task.dead_line.day = Number(selections_dom.getElementsByClassName('s-day')[0].value);
		task.dead_line.hour = Number(selections_dom.getElementsByClassName('s-hour')[0].value);
		task.dead_line.min = Number(selections_dom.getElementsByClassName('s-minutes')[0].value);

		task.check_list = [];

		task.body = convertTextToHTML(modal_dom.getElementsByClassName('i-body')[0].value, task);

		category = getCategoryObjectByName(modal_dom.getElementsByClassName('i-category')[0].value);

		if (task.title === '') {
			alert('タイトルを入力してください');
			return false;
		}

		if (!category) {
			alert('存在するカテゴリーを入力してください');
			return false;
		}

		task.category_id = category.id;

		tasks.push(task);
		category.tasks.push(task.id);

		max_task_id++;

		saveTasksToStorage();
		saveCategoriesToStorage();
		saveMaxTaskIdToStorage();

		alert('保存が完了しました');

		clearModalWindowValue('task');
		renderTasks(selecting_category_id, done_tasks_visible.is_visible());
	};


	/* edit-task関連*/


	var editTask = function (_task_id) {
		return function () {
			var modal_dom = document.getElementById('modal-window');
			var selections_dom = modal_dom.getElementsByClassName('selections')[0];

			var task = getTaskObjectById(_task_id);
			var category = {};

			task.title = modal_dom.getElementsByClassName('i-title')[0].value;

			task.dead_line.year = Number(selections_dom.getElementsByClassName('s-year')[0].value);
			task.dead_line.month = Number(selections_dom.getElementsByClassName('s-month')[0].value);
			task.dead_line.day = Number(selections_dom.getElementsByClassName('s-day')[0].value);
			task.dead_line.hour = Number(selections_dom.getElementsByClassName('s-hour')[0].value);
			task.dead_line.min = Number(selections_dom.getElementsByClassName('s-minutes')[0].value);

			task.check_list = [];

			task.body = convertTextToHTML(modal_dom.getElementsByClassName('i-body')[0].value, task);

			category = getCategoryObjectByName(modal_dom.getElementsByClassName('i-category')[0].value);

			if (task.title === '') {
				alert('タイトルを入力してください');
				return false;
			}

			if (!category) {
				alert('存在するカテゴリーを入力してください');
				return false;
			}

			//カテゴリーが変更されている可能性があるので
			removeCategoriesTasksId(_task_id);

			task.category_id = category.id;

			//登録先のカテゴリーに編集したタスクのidが含まれていなかった場合にのみcategory.tasksにpushする
			if(!searchCategoriesTask(category.id, task.id)) {
				category.tasks.push(task.id);
			}

			saveTasksToStorage();
			saveCategoriesToStorage();
			saveMaxTaskIdToStorage();

			alert('保存が完了しました');

			closeModalWindow();
			renderSideMenu(task.id);
			renderTasks(selecting_category_id, done_tasks_visible.is_visible());
		}
	};

	//編集するタスクの元の情報をあらかじめフォームに入力しておく
	var renderTaskInformationToForm = function (_task_id) {
		var modal_dom = document.getElementById('modal-window');
		var selections_dom = modal_dom.getElementsByClassName('selections')[0];

		var task = getTaskObjectById(_task_id);
		var plane_body_txt = convertHTMLToText(task.body);

		modal_dom.getElementsByClassName('i-title')[0].value = task.title;

		selections_dom.getElementsByClassName('s-year')[0].value = task.dead_line.year;
		selections_dom.getElementsByClassName('s-month')[0].value = task.dead_line.month;
		selections_dom.getElementsByClassName('s-day')[0].value = task.dead_line.day;
		selections_dom.getElementsByClassName('s-hour')[0].value = task.dead_line.hour;
		selections_dom.getElementsByClassName('s-minutes')[0].value = task.dead_line.min;

		modal_dom.getElementsByClassName('i-body')[0].value = plane_body_txt;

		modal_dom.getElementsByClassName('i-category')[0].value = getCategoryObjectById(task.category_id).name;
	};


	/* new-category関連 */


	var createNewCategory = function () {
		var modal_dom = document.getElementById('modal-window');

		var category = {};

		category.id = max_category_id + 1;
		category.name = modal_dom.getElementsByClassName('i-name')[0].value;
		category.tasks = [];

		if (category.name === '') {
			alert('名前を入力してください');
			return false;
		}

		if (getCategoryObjectByName(category.name)) {
			alert('そのカテゴリーはすでに存在しています');
			return false;
		}

		categories.push(category);
		max_category_id++;

		saveCategoriesToStorage();
		saveMaxCategoryIdToStorage();

		alert('保存が完了しました');

		clearModalWindowValue('category');
		renderCategories();
		//新規作成したカテゴリーにフォーカスする
		category_list_dom.children[category_list_dom.children.length - 2].getElementsByTagName('a')[0].click();
	};


	/* edit-category関連 */


	var editCategory = function (_target_id, _update_dom) {
		return function () {
			var category = getCategoryObjectById(_target_id);

			category.name = document.getElementById('modal-window').getElementsByClassName('i-name')[0].value;

			if (category.name === '') {
				alert('名前を入力してください');
				return false;
			}

			saveCategoriesToStorage();

			alert('保存が完了しました');

			closeModalWindow();
			//カテゴリー内のタスクを表示する
			_update_dom.click();
		}
	};


	/* new-taskフォーム関連 */

	//selectのoption(年月日時分)を生成する
	var generateNewTaskSelectOptions = function () {
		var now = new Date();
		var year = now.getFullYear();

		//selectionのDOM要素群
		var year_selections_dom = document.getElementsByClassName('s-year')[0];
		var month_selections_dom = document.getElementsByClassName('s-month')[0];
		var day_selections_dom = document.getElementsByClassName('s-day')[0];
		var hour_selections_dom = document.getElementsByClassName('s-hour')[0];
		var minutes_selections_dom = document.getElementsByClassName('s-minutes')[0];

		var tmp_dom = document.createDocumentFragment();

		//現在の年から50年後までをオプションとして追加
		for (var i = year, limit = i + 50; i <= limit; i++) {
			var option_dom = document.createElement('option');
			option_dom.value = i;
			option_dom.innerHTML = i;

			tmp_dom.appendChild(option_dom);
		}
		year_selections_dom.appendChild(tmp_dom);
		tmp_dom = document.createDocumentFragment();

		//月のselect要素にオプションを追加
		for (var i = 1; i <= 12; i++) {
			var option_dom = document.createElement('option');
			option_dom.value = i;
			option_dom.innerHTML = i;

			tmp_dom.appendChild(option_dom);
		}
		month_selections_dom.appendChild(tmp_dom);
		tmp_dom = document.createDocumentFragment();

		//日のselect要素にオプションを追加
		for (var i = 1; i <= 31; i++) {
			var option_dom = document.createElement('option');
			option_dom.value = i;
			option_dom.innerHTML = i;

			tmp_dom.appendChild(option_dom);
		}
		day_selections_dom.appendChild(tmp_dom);
		tmp_dom = document.createDocumentFragment();

		//時のselect要素にオプションを追加
		for (var i = 0; i <= 23; i++) {
			var option_dom = document.createElement('option');
			option_dom.value = i;
			option_dom.innerHTML = i;

			tmp_dom.appendChild(option_dom);
		}
		hour_selections_dom.appendChild(tmp_dom);
		tmp_dom = document.createDocumentFragment();

		//分のselect要素にオプションを追加
		for (var i = 0; i <= 59; i++) {
			var option_dom = document.createElement('option');
			option_dom.value = i;
			option_dom.innerHTML = i;

			tmp_dom.appendChild(option_dom);
		}

		minutes_selections_dom.appendChild(tmp_dom);
	};

	//月と日を基に日付フォームを再設定する関数
	var regenerateDayFormOptions = function () {
		var limit_day = 31;

		var year = document.getElementsByClassName('s-year')[1].value;
		var month = document.getElementsByClassName('s-month')[1].value;

		var day_selections_dom = document.getElementsByClassName('s-day')[1];
		var prev_options_dom = day_selections_dom.getElementsByTagName('option');

		var tmp_dom = document.createDocumentFragment();

		//init
		day_selections_dom.innerHTML = '';

		//その月の最大日数をlimit_dayに設定
		switch (Number(month)) {
			case 2:
				//閏年判定
				if (Number(year) % 4 === 0) {
					limit_day = 29;
				} else {
					limit_day = 28;
				}
				break;

			case 4:
			case 6:
			case 9:
			case 11:
				limit_day = 30;
				break;

			default:
				limit_day = 31;
				break;
		}

		for (var i = 1; i <= limit_day; i++) {
			option_dom = document.createElement('option');
			option_dom.value = i;
			option_dom.innerHTML = i;

			tmp_dom.appendChild(option_dom);
		}
		day_selections_dom.appendChild(tmp_dom);
	};

	//新規task作成の際、あらかじめ現在の日付、時刻を設定しておく
	var setNowTimeToForm = function () {
		var now = new Date();
		var modal_dom = document.getElementById('modal-window');

		if (!modal_dom) {
			return false;
		}

		modal_dom.getElementsByClassName('s-year')[0].value = now.getFullYear();
		modal_dom.getElementsByClassName('s-month')[0].value = now.getMonth() + 1;
		modal_dom.getElementsByClassName('s-day')[0].value = now.getDate();
		modal_dom.getElementsByClassName('s-hour')[0].value = now.getHours();
		modal_dom.getElementsByClassName('s-minutes')[0].value = now.getMinutes();
	}


	/* modal-window関連 */


	//_target_doms_idには開く対象のDOMのidが。_is_editには編集かするどうか、_edit_target_idには編集する対象のidがそれぞれ入る。
	var openModalWindow = function (_target_doms_id, _is_edit, _edit_target_id) {
		return function (_evt) {
			//すでにopenされてる時は何もしない
			if (document.getElementById('modal-window')) return false;

			//modalのひな形を生成
			var overlay_dom = document.createElement('div');
			overlay_dom.id = 'modal-overlay';

			var target_dom = document.getElementById(_target_doms_id).children[0].cloneNode(true);

			var modal_dom = document.createElement('div');
			var modal_container_dom = document.createElement('div');

			var close_btn_dom = document.createElement('span');

			var modal_content_dom = document.createElement('div');

			var headers_inner_dom = target_dom.getElementsByTagName('h2')[0];
			var submit_btn_dom = target_dom.getElementsByClassName('i-submit')[0];

			modal_dom.id = 'modal-window';

			modal_container_dom.classList.add('modal-container');

			close_btn_dom.classList.add('close-button');
			close_btn_dom.innerHTML = "☓";

			modal_content_dom.classList.add('modal-content');

			headers_inner_dom.innerHTML = '新規タスク';
			submit_btn_dom.value = '追加';

			modal_content_dom.appendChild(target_dom);
			modal_container_dom.appendChild(close_btn_dom);
			modal_container_dom.appendChild(modal_content_dom);
			modal_dom.appendChild(modal_container_dom);

			body_dom.appendChild(overlay_dom);
			body_dom.appendChild(modal_dom);

			//開くDOMのidにより条件を分岐する
			switch (_target_doms_id) {
				case 'new-task':
					target_dom.getElementsByClassName('s-year')[0].addEventListener('change', regenerateDayFormOptions, false);
					target_dom.getElementsByClassName('s-month')[0].addEventListener('change', regenerateDayFormOptions, false);

					//is_editがtrueの時は新規作成ではなく、編集の設定を与えてあげる
					if (_is_edit) {
						renderTaskInformationToForm(_edit_target_id);

						headers_inner_dom.innerHTML = 'タスク編集';
						submit_btn_dom.value = '保存';

						submit_btn_dom.addEventListener('click', editTask(_edit_target_id), false);
						break;
					}
					setNowTimeToForm();

					target_dom.getElementsByClassName('i-category')[0].value = getExistCategoryName();
					submit_btn_dom.addEventListener('click', createNewTask, false);

					break;
				case 'new-category':
					if (_is_edit) {
						//編集前のカテゴリーの名前をフォームに登録しておく
						target_dom.getElementsByClassName('i-name')[0].value = getCategoryObjectById(_edit_target_id).name;

						headers_inner_dom.innerHTML = 'カテゴリー編集';
						submit_btn_dom.value = '保存';

						var category_btn_dom = _evt.target.parentNode.parentNode.parentNode.parentNode.children[1];

						submit_btn_dom.addEventListener('click', editCategory(_edit_target_id, category_btn_dom), false);
						break;
					}
					headers_inner_dom.innerHTML = '新規カテゴリー';

					submit_btn_dom.addEventListener('click', createNewCategory, false);

					break;
				default:
					break;
			}

			//アニメーション関連
			modal_dom.style.opacity = 0;
			modal_dom.style.width = target_dom.offsetWidth + 'px';

			modal_dom.style.top = (window.innerHeight / 2 - modal_dom.clientHeight / 2) + 'px';

			close_btn_dom.style.right = 0;

			modal_dom.classList.add('open-modal');
			overlay_dom.classList.add('open-overlay');

			setTimeout(function () {
				modal_dom.classList.remove('open-modal');
				modal_dom.style.opacity = 1;

				close_btn_dom.addEventListener('click', closeModalWindow, false);
				overlay_dom.addEventListener('click', closeModalWindow, false);
			}, 500);
		}
	};

	var closeModalWindow = function () {
		var modal_dom = document.getElementById('modal-window');
		var overlay_dom = document.getElementById('modal-overlay');

		modal_dom.getElementsByClassName('close-button')[0].removeEventListener('click', closeModalWindow, false);
		overlay_dom.removeEventListener('click', closeModalWindow, false);

		modal_dom.classList.add('close-modal');
		overlay_dom.classList.add('close-overlay');

		setTimeout(function () {
			modal_dom.parentNode.removeChild(modal_dom);
			overlay_dom.parentNode.removeChild(overlay_dom);
		}, 300);
	};

	var clearModalWindowValue = function (_option) {
		var modal_dom = document.getElementById('modal-window');

		switch (_option) {
			case 'task':
				modal_dom.getElementsByClassName('i-title')[0].value = '';
				modal_dom.getElementsByClassName('i-category')[0].value = getExistCategoryName();

				setNowTimeToForm();

				modal_dom.getElementsByClassName('i-body')[0].value = '';

				break;
			case 'category':
				modal_dom.getElementsByClassName('i-name')[0].value = '';
				break;
			default:
				break;
		}
	};


	/* side-menu関連 */


	var initSideMenu = function () {
		var side_menu_dom = document.getElementById('side-menu');

		var titles_p_dom = side_menu_dom.getElementsByClassName('title')[0].getElementsByTagName('p')[0];
		var deadlines_time_dom = side_menu_dom.getElementsByClassName('dead-line')[0].getElementsByTagName('time')[0];
		var bodys_p_dom = side_menu_dom.getElementsByClassName('body')[0].getElementsByTagName('div')[0];

		titles_p_dom.innerHTML = '';
		deadlines_time_dom.innerHTML = '';
		bodys_p_dom.innerHTML = '';

		opening_task_id = null;
	}

	var renderSideMenu = function (_task_id) {
		initSideMenu();

		opening_task_id = _task_id;

		var side_menu_dom = document.getElementById('side-menu');
		var task = getTaskObjectById(_task_id);

		var checkbox_dom = side_menu_dom.getElementsByClassName('check-box')[0];

		var fav_dom = side_menu_dom.getElementsByClassName('util')[0].getElementsByClassName('fav')[0];

		var titles_p_dom = side_menu_dom.getElementsByClassName('title')[0].getElementsByTagName('p')[0];

		var deadline_dom = side_menu_dom.getElementsByClassName('dead-line')[0];
		var deadlines_time_dom = deadline_dom.getElementsByTagName('time')[0];
		var deadlines_icon_dom = document.createElement('i');

		var bodys_div_dom = side_menu_dom.getElementsByClassName('body')[0].getElementsByTagName('div')[0];
		var bodys_checklist_doms = null;

		if (task.is_done) {
			checkbox_dom.getElementsByTagName('i')[0].className = 'fa fa-check-square';
		} else {
			checkbox_dom.getElementsByTagName('i')[0].className = 'fa fa-square';
		}

		if (task.is_fav) {
			fav_dom.getElementsByTagName('i')[0].className = 'fa fa-star';
		} else {
			fav_dom.getElementsByTagName('i')[0].className = 'fa fa-star-o';
		}

		titles_p_dom.innerHTML = task.title;

		deadlines_time_dom.innerHTML = `${task.dead_line.year}/${task.dead_line.month}/${task.dead_line.day}`;
		deadlines_icon_dom.classList.add('fa', 'fa-clock-o');
		deadlines_time_dom.appendChild(deadlines_icon_dom);
		deadlines_time_dom.innerHTML += `${task.dead_line.hour}:${changeMinutesNotation(task.dead_line.min)}`;

		if (deadline_dom.getElementsByClassName('achievement-rate').length !== 0) {
			deadline_dom.removeChild(deadline_dom.getElementsByClassName('achievement-rate')[0]);
		}

		bodys_div_dom.innerHTML = task.body;

		if (task.check_list.length !== 0) {
			deadline_dom.appendChild(createProgressBarElement(task));
			//checkboxにイベントを与えるためaを配列に格納する
			if (bodys_div_dom.getElementsByTagName('a')) {
				bodys_checklist_doms = bodys_div_dom.getElementsByTagName('a');

				for (var i = 0, len = bodys_checklist_doms.length; i < len; i++) {
					if (task.check_list[i]) {
						bodys_checklist_doms[i].getElementsByTagName('i')[0].classList.remove('fa-square-o');
						bodys_checklist_doms[i].getElementsByTagName('i')[0].classList.add('fa-check-square-o');
					} else {
						bodys_checklist_doms[i].getElementsByTagName('i')[0].classList.remove('fa-check-square-o');
						bodys_checklist_doms[i].getElementsByTagName('i')[0].classList.add('fa-square-o');
					}
					bodys_checklist_doms[i].addEventListener('click', toggleCheckListsValue(i, task), false);
				}
			}
		}
	};

	//containerの裏ににサイドメニューを置き、上のcontainerをrightにスライドさせるアニメーション
	var openSideMenu = function (_task_id) {
		return function () {
			//すでにopenされてる時は何もしない
			if (document.getElementsByClassName('open-side-menu')[0]) return false;

			renderSideMenu(_task_id);

			container_dom.classList.add('open-side-menu');
			container_dom.style.width = window.innerWidth + 'px';

			var side_menu_dom = document.getElementById('side-menu');

			var checkbox_dom = side_menu_dom.getElementsByClassName('check-box')[0];
			var util_dom = side_menu_dom.getElementsByClassName('util')[0];

			var edit_dom = util_dom.getElementsByClassName('edit')[0];
			var trash_dom = util_dom.getElementsByClassName('trash')[0];
			var fav_dom = util_dom.getElementsByClassName('fav')[0];

			side_menu_dom.classList.add('open');

			checkbox_dom.addEventListener('click', toggleIsDone(_task_id), false);

			edit_dom.addEventListener('click', openModalWindow('new-task', true, _task_id), false);
			trash_dom.addEventListener('click', removeTask(_task_id), false);
			fav_dom.addEventListener('click', toggleIsFav(_task_id), false);

			side_menu_dom.style.zIndex = -1;

			setTimeout(function () {
				//z-indexを戻さないとサイドメニューがclick出来なくなるため
				side_menu_dom.style.zIndex = 1;
				document.getElementsByClassName('open-side-menu')[0].addEventListener('click', closeSideMenu, false);
			}, 200);
			//side_menu_dom
		}
	};

	var closeSideMenu = function () {
		document.getElementsByClassName('open-side-menu')[0].removeEventListener('click', closeSideMenu, false);

		container_dom.classList.remove('open-side-menu');
		container_dom.classList.add('close-side-menu');

		container_dom.style.width = window.innerWidth + 'px';

		var side_menu_dom = document.getElementById('side-menu');

		var checkbox_dom = side_menu_dom.getElementsByClassName('check-box')[0];
		var util_dom = side_menu_dom.getElementsByClassName('util')[0];

		var clone_checkbox_dom = checkbox_dom.cloneNode(true);
		var clone_util_dom = util_dom.cloneNode(true);

		checkbox_dom.parentNode.replaceChild(clone_checkbox_dom, checkbox_dom);
		util_dom.parentNode.replaceChild(clone_util_dom, util_dom);

		side_menu_dom.style.zIndex = -1;

		setTimeout(function () {
			initSideMenu();
			container_dom.classList.remove('close-side-menu');
			side_menu_dom.classList.remove('open');
		}, 200);
	};


	/* 読み込み完了時 */


	document.addEventListener('DOMContentLoaded', function () {
		body_dom = document.getElementsByTagName('body')[0];
		container_dom = document.getElementById('container');
		category_list_dom = document.getElementsByClassName('sec-category')[0].getElementsByTagName('ul')[0];

		generateNewTaskSelectOptions();
		renderCategories();

		renderTasks('all', false);

		done_tasks_visible = toggleIsDoneVisible();

		category_list_dom.addEventListener('click', onClickCategory, false);

		document.getElementsByClassName('add-task-btn')[0].addEventListener('click', openModalWindow('new-task'), false);
		document.getElementsByClassName('add-category-btn')[0].addEventListener('click', openModalWindow('new-category'), false);
		document.getElementsByClassName('display-done-tasks-btn')[0].addEventListener('click', done_tasks_visible.toggle, false);
	}, false);
})();