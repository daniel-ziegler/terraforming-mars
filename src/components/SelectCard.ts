
import Vue from 'vue';
import {Button} from '../components/common/Button';
import {Message} from '../Message';
import {CardOrderStorage} from './CardOrderStorage';
import {PlayerModel} from '../models/PlayerModel';
import {VueModelCheckbox, VueModelRadio} from './VueTypes';
import {Card} from './card/Card';
import {CardModel} from '../models/CardModel';
import {CardName} from '../CardName';
import {PlayerInputModel} from '../models/PlayerInputModel';
import {sortActiveCards} from '../components/ActiveCardsSortingOrder';

interface SelectCardModel {
  cards: VueModelRadio<CardModel> | VueModelCheckbox<Array<CardModel>>;
  warning: string | Message | undefined;
}

export const SelectCard = Vue.component('select-card', {
  props: {
    player: {
      type: Object as () => PlayerModel,
    },
    playerinput: {
      type: Object as () => PlayerInputModel,
    },
    onsave: {
      type: Function as unknown as () => (out: Array<Array<string>>) => void,
    },
    showsave: {
      type: Boolean,
    },
    showtitle: {
      type: Boolean,
    },
  },
  data: function() {
    return {
      cards: [],
      warning: undefined,
    } as SelectCardModel;
  },
  components: {
    Card,
    Button,
  },
  watch: {
    cards: function() {
      this.$emit('cardschanged', this.getData());
    },
  },
  methods: {
    cardsSelected: function(): number {
      if (Array.isArray(this.cards)) {
        return this.cards.length;
      } else if (this.cards === false || this.cards === undefined) {
        return 0;
      }
      return 1;
    },
    getOrderedCards: function() {
      if (this.playerinput.cards === undefined) {
        return [];
      }
      if (this.playerinput.selectBlueCardAction) {
        return sortActiveCards(this.playerinput.cards);
      } else {
        return CardOrderStorage.getOrdered(
          CardOrderStorage.getCardOrder(this.player.id),
          this.playerinput.cards,
        );
      }
    },
    hasCardWarning: function() {
      if (Array.isArray(this.cards)) {
        return false;
      } else if (typeof this.cards === 'object' && this.cards.warning !== undefined) {
        this.warning = this.cards.warning;
        return true;
      }
      return false;
    },
    isOptionalToManyCards: function(): boolean {
      return this.playerinput.maxCardsToSelect !== undefined &&
             this.playerinput.maxCardsToSelect > 1 &&
             this.playerinput.minCardsToSelect === 0;
    },
    getData: function(): Array<CardName> {
      return Array.isArray(this.$data.cards) ? this.$data.cards.map((card) => card.name) : [this.$data.cards.name];
    },
    saveData: function() {
      this.onsave([this.getData()]);
    },
  },
  template: `<div class="wf-component wf-component--select-card">
        <div v-if="showtitle === true" class="nofloat wf-component-title" v-i18n>{{ playerinput.title.toString() }}</div>
        <label v-for="card in getOrderedCards()" :key="card.name" class="cardbox">
            <input v-if="playerinput.maxCardsToSelect === 1 && playerinput.minCardsToSelect === 1" type="radio" v-model="cards" :value="card" />
            <input v-else type="checkbox" v-model="cards" :value="card" :disabled="playerinput.maxCardsToSelect !== undefined && Array.isArray(cards) && cards.length >= playerinput.maxCardsToSelect && cards.indexOf(card) === -1" />
            <Card :card="card" />
        </label>
        <div v-if="hasCardWarning()" class="card-warning" v-i18n>{{ (warning || '').toString() }}</div>
        <div v-if="showsave === true" class="nofloat">
            <Button :disabled="isOptionalToManyCards() && cardsSelected() === 0" type="submit" :onClick="saveData" :title="playerinput.buttonLabel" />
            <Button :disabled="isOptionalToManyCards() && cardsSelected() > 0" v-if="isOptionalToManyCards()" :onClick="saveData" type="submit" :title="'Skip this action'" />
        </div>
    </div>`,
});

