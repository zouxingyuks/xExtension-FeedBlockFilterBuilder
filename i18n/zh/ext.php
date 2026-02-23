<?php

return [
	'ext' => [
		'feedBlockFilterBuilder' => [
			'buttonTooltip' => '创建屏蔽过滤规则',
			'modalTitle' => '创建过滤规则',
			'dimensionLabel' => '过滤维度',
			'dimensionIntitle' => '标题 (intitle:)',
			'dimensionAuthor' => '作者 (author:)',
			'expressionLabel' => '过滤表达式',
			'expressionPlaceholder' => '输入或编辑过滤表达式…',
			'previewLabel' => '规则预览',
			'previewPlaceholder' => '选择维度并输入表达式后预览',
			'submitButton' => '提交规则',
			'cancelButton' => '取消',
			'submitting' => '提交中…',
			'successMessage' => '过滤规则已成功添加',
			'errorMessage' => '添加过滤规则失败',
			'errorNoFeedId' => '无法获取当前文章的订阅源 ID',
			'errorFetchFailed' => '获取订阅源配置失败',
			'errorParseFailed' => '解析订阅源配置页面失败',
			'errorCsrfUnavailable' => 'CSRF token 不可用',
			'errorNetworkError' => '网络请求失败',
			'duplicateRule' => '该规则已存在',
		],
	],
];
