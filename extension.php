<?php

class FeedBlockFilterBuilderExtension extends Minz_Extension {

	public function init(): void {
		$this->registerHook('js_vars', [$this, 'jsVars']);
		Minz_View::appendScript($this->getFileUrl('script.js'));
		Minz_View::appendStyle($this->getFileUrl('style.css'));
	}

	public function jsVars(array $vars): array {
		$lang = Minz_Translate::language();
		$langDir = (strncmp($lang, 'zh', 2) === 0) ? 'zh' : 'en';
		$i18nFile = __DIR__ . '/i18n/' . $langDir . '/ext.php';
		$strings = file_exists($i18nFile) ? include($i18nFile) : [];
		$i18n = $strings['ext']['feedBlockFilterBuilder'] ?? [];

		$vars['extensions']['feedBlockFilterBuilder'] = [
			'i18n' => $i18n,
		];
		return $vars;
	}
}
