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
				'dimensionTitle' => '标题 (intitle:)',
				'dimensionAuthor' => '作者 (author:)',
				'dimensionCustom' => '自定义（原生语法）',
				'expressionLabel' => '过滤表达式',
				'expressionPlaceholder' => '输入或编辑过滤表达式…',
				'previewLabel' => '规则预览',
				'previewPlaceholder' => '选择维度并输入表达式后预览',
				'submitBtn' => '提交规则',
				'cancelBtn' => '取消',
				'submitting' => '提交中…',
				'successNotification' => '过滤规则已成功添加',
				'errorSubmit' => '添加过滤规则失败',
				'errorNoFeedId' => '无法获取当前文章的订阅源 ID',
				'errorFilterField' => '获取订阅源配置失败',
				'errorFormNotFound' => '解析订阅源配置页面失败',
				'errorNetwork' => '网络请求失败',
				'errorDuplicate' => '该规则已存在',
				'errorNotReady' => '扩展尚未就绪，请稍后重试',
			],
			'en' => [
				'buttonTooltip' => 'Create block filter rule',
				'modalTitle' => 'Create Filter Rule',
				'dimensionLabel' => 'Filter dimension',
				'dimensionTitle' => 'Title (intitle:)',
				'dimensionAuthor' => 'Author (author:)',
				'dimensionCustom' => 'Custom (native syntax)',
				'expressionLabel' => 'Filter expression',
				'expressionPlaceholder' => 'Enter or edit filter expression…',
				'previewLabel' => 'Rule preview',
				'previewPlaceholder' => 'Select a dimension and enter expression to preview',
				'submitBtn' => 'Submit Rule',
				'cancelBtn' => 'Cancel',
				'submitting' => 'Submitting…',
				'successNotification' => 'Filter rule added successfully',
				'errorSubmit' => 'Failed to add filter rule',
				'errorNoFeedId' => 'Cannot extract feed ID from current article',
				'errorFilterField' => 'Failed to fetch feed configuration',
				'errorFormNotFound' => 'Failed to parse feed configuration page',
				'errorNetwork' => 'Network request failed',
				'errorDuplicate' => 'This rule already exists',
				'errorNotReady' => 'Extension not ready, please try again',
			],
		];

		return $strings[$lang] ?? $strings['en'];
	}
}
