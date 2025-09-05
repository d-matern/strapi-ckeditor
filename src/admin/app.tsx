import  { type StrapiApp } from '@strapi/strapi/admin';
import {
  Bold,
  Italic,
  Essentials,
  Heading,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Link,
  List,
  Paragraph,
} from 'ckeditor5';

import {
  type PluginConfig,
  type Preset,
  setPluginConfig,
  StrapiMediaLib,
  StrapiUploadAdapter,
} from '@_sh/strapi-plugin-ckeditor';

import InsertHelloPlugin from './ckeditor-plugins/InsertHelloPlugin';
import Block2Plugin from './ckeditor-plugins/Block2Plugin';

const myCustomPreset: Preset = {
  name: 'myCustomPreset',
  description: 'myCustomPreset description',
  editorConfig: {
    licenseKey: 'GPL',
    plugins: [
      Bold,
      Italic,
      Essentials,
      Heading,
      Image,
      ImageCaption,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      Link,
      List,
      Paragraph,
      StrapiMediaLib,
      StrapiUploadAdapter,
      InsertHelloPlugin,
      Block2Plugin,
    ],
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'strapiMediaLib',
      '|',
      'undo',
      'redo',
      '|',
      'insertHello',
      'block2',
    ],
  },
};

const myConfig: PluginConfig = {
  /**
   * Note that since provided `presets` includes only `myCustomPreset`
   * this configuration will overwrite default presets.
   */
  presets: [myCustomPreset],
};

export default {
  config: {
    locales: [
      // 'ar',
      // 'fr',
      // 'cs',
      // 'de',
      // 'dk',
      // 'es',
      // 'he',
      // 'id',
      // 'it',
      // 'ja',
      // 'ko',
      // 'ms',
      // 'nl',
      // 'no',
      // 'pl',
      // 'pt-BR',
      // 'pt',
      // 'ru',
      // 'sk',
      // 'sv',
      // 'th',
      // 'tr',
      // 'uk',
      // 'vi',
      // 'zh-Hans',
      // 'zh',
    ],
  },
  register() {
    setPluginConfig(myConfig);
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
  },
};
