<?php

class FeedBlockFilterBuilderExtension extends Minz_Extension {

	public function init(): void {
		$this->registerHook('js_vars', [$this, 'jsVars']);
		Minz_View::appendScript($this->getFileUrl('script.js'));
		Minz_View::appendStyle($this->getFileUrl('style.css'));
	}

	public function jsVars(array $vars): array {
		$lang = Minz_Translate::language();
		if (strncmp($lang, 'zh', 2) === 0) {
			$lang = 'zh';
		} else {
			$lang = 'en';
		}

		$vars['extensions']['feedBlockFilterBuilder'] = [
			'i18n' => $this->getI18nStrings($lang),
		];
		return $vars;
	}

	private function getI18nStrings(string $lang): array {
		$strings = [
			'zh' => [
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
			'en' => [
				'buttonTooltip' => 'Create block filter rule',
				'modalTitle' => 'Create Filter Rule',
				'dimensionLabel' => 'Filter dimension',
				'dimensionIntitle' => 'Title (intitle:)',
				'dimensionAuthor' => 'Author (author:)',
				'expressionLabel' => 'Filter expression',
				'expressionPlaceholder' => 'Enter or edit filter expression…',
				'previewLabel' => 'Rule preview',
				'previewPlaceholder' => 'Select a dimension and enter expression to preview',
				'submitButton' => 'Submit Rule',
				'cancelButton' => 'Cancel',
				'submitting' => 'Submitting…',
				'successMessage' => 'Filter rule added successfully',
				'errorMessage' => 'Failed to add filter rule',
				'errorNoFeedId' => 'Cannot extract feed ID from current article',
				'errorFetchFailed' => 'Failed to fetch feed configuration',
				'errorParseFailed' => 'Failed to parse feed configuration page',
				'errorCsrfUnavailable' => 'CSRF token unavailable',
				'errorNetworkError' => 'Network request failed',
				'duplicateRule' => 'This rule already exists',
			],
		];

		return $strings[$lang] ?? $strings['en'];
	}
}
